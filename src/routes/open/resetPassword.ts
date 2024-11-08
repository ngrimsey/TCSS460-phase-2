// express is the framework we're going to use to handle requests
import express, { Request, Response, Router, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';

export interface Auth {
    email: string;
    username: string;
    password: string;
}

export interface AuthRequest extends Request {
    auth: Auth;
}

const isStringProvided = validationFunctions.isStringProvided;
const generateHash = credentialingFunctions.generateHash;
const generateSalt = credentialingFunctions.generateSalt;

const resetPWRouter: Router = express.Router();

const key = {
    secret: process.env.JSON_WEB_TOKEN,
};

const isValidPassword = (password: string): boolean =>
    isStringProvided(password) &&
    password.length > 7 &&
    /[!@#$%^&*]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

/**
 * @api {put} /login Request to reset a user's password
 *
 * @apiDescription Request to reset a user's password while logged out
 * - Requires the user's current email and username, and the desired new password
 *
 * Password rules:
 * - Must be at least 8 characters long
 * - Must contain at least one special character
 * - Must contain at least one capital letter
 * - Must contain at least one number
 *
 * @apiName PutResetPassword
 * @apiGroup Open
 *
 * @apiBody {String} email a user's email
 * @apiBody {String} username a user's username
 * @apiBody {String} password the user's desired new password
 *
 * @apiSuccess {String} accessToken JSON Web Token
 * @apiSuccess {number} id unique user id
 *
 * @apiError (400: Missing Parameters) {String} message "Missing email or username"
 * @apiError (400: Missing Parameters) {String} message "Missing or invalid password"
 * @apiError (404: User Not Found) {String} message "User not found"
 *
 */

resetPWRouter.put(
    '/reset',
    (request: AuthRequest, response: Response, next: NextFunction) => {
        if (
            isStringProvided(request.body.email) &&
            isStringProvided(request.body.username)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Missing email or username',
            });
        }
    },
    (request: AuthRequest, response: Response, next: NextFunction) => {
        if (isValidPassword(request.body.password)) {
            next();
        } else {
            response.status(400).send({
                message: 'Missing or invalid password',
            });
        }
    },
    (request: AuthRequest, response: Response) => {
        const theQuery = `SELECT salted_hash, salt, Account_Credential.account_id, account.email, account.firstname, account.lastname, account.phone, account.username, account.account_role FROM Account_Credential
                      INNER JOIN Account ON
                      Account_Credential.account_id = Account.account_id 
                      WHERE Account.email = $1 AND Account.username = $2`;
        const values = [request.body.email, request.body.username];
        pool.query(theQuery, values)
            .then((result) => {
                if (result.rowCount == 0) {
                    response.status(404).send({
                        message: 'User not found',
                    });
                    return;
                } else if (result.rowCount > 1) {
                    //log the error
                    console.error(
                        'DB Query error on sign in: too many results returned'
                    );
                    response.status(500).send({
                        message: 'server error - contact support',
                    });
                    return;
                }
                const userID = result.rows[0].account_id;
                const salt = generateSalt(32);
                const saltedHash = generateHash(request.body.password, salt);
                const theQuery =
                    'UPDATE Account_Credential SET salted_hash = $1, salt = $2 WHERE account_id = $3';
                const values = [saltedHash, salt, userID];
                pool.query(theQuery, values).then(() => {
                    const accessToken = jwt.sign(
                        {
                            role: request.body.role,
                            id: userID,
                        },
                        key.secret,
                        {
                            expiresIn: '14 days', // expires in 14 days
                        }
                    );
                    //We successfully added the user!
                    response.status(201).send({
                        accessToken,
                        id: userID,
                    });
                });
            })
            .catch((error) => {
                //log the error
                console.error('DB Query error on sign in');
                console.error(error);
                response.status(500).send({
                    message: 'server error - contact support',
                });
            });
    }
);

export { resetPWRouter as signinRouter };
