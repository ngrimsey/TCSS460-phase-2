//express is the framework we're going to use to handle requests
import express, { NextFunction, Request, Response, Router } from 'express';
//Access the connection to Postgres Database
import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';
import { IJwtRequest } from '../../core/models';

export interface Auth {
    email: string;
    password: string;
}

export interface AuthRequest extends Request {
    auth: Auth;
}

const pwRouter: Router = express.Router();

const isStringProvided = validationFunctions.isStringProvided;
const generateHash = credentialingFunctions.generateHash;
const generateSalt = credentialingFunctions.generateSalt;

// Password validation
// Password must be at least 8 characters long and contain at least one
// uppercase letter, one lowercase letter, one number, and one special character(!, @, #, $, %, ^, &, *)
const isValidPassword = (password: string): boolean =>
    isStringProvided(password) &&
    password.length > 7 &&
    /[!@#$%^&*]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);

/**
 * @apiDefine JWT
 * @apiHeader {String} Authorization The string "Bearer " + a valid JSON Web Token (JWT).
 */

/**
 * @api {post} /c/changePassword Request to change a user's password
 *
 * @apiDescription Request to change a user's password in the DB
 * - Requires a JWT obtained from /auth/login
 * - Requires the user's current password
 *
 * @apiName ClosedPostPassword
 * @apiGroup Closed
 *
 * @apiUse JWT
 *
 * @apiBody {string} currentpassword the user's current password
 * @apiBody {string} newpassword the user's new password
 *
 * @apiSuccess {String} message "Password changed successfully"
 *
 * @apiError (400: Missing currrent password) {String} message "Missing current password - please refer to documentation"
 * @apiError (400: Invalid Password) {String} message "Invalid or missing new password  - please refer to documentation"
 * @apiError (400: JSON Error) {String} message "malformed JSON in parameters"
 * @apiError (404: User Not Found) {String} message "User not found"
 * @apiError (400: Invalid Credentials) {String} message "Credentials did not match"
 */
pwRouter.post(
    '/changePassword',
    (request: Request, response: Response, next: NextFunction) => {
        if (isStringProvided(request.body.currentpassword)) {
            next();
        } else {
            response.status(400).send({
                message:
                    'Missing current password - please refer to documentation',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidPassword(request.body.newpassword)) {
            next();
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing new password - please refer to documentation',
            });
        }
    },
    (request: IJwtRequest, response: Response) => {
        // use ID from JWT to get salt, use salt to test password
        const theQuery = `SELECT salted_hash, salt, Account_Credential.account_id, 
                      FROM Account_Credential
                      INNER JOIN Account ON
                      Account_Credential.account_id=Account.account_id 
                      WHERE Account.account_id=$1`;
        const values = [request.claims.id];
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
                        message:
                            'server error - contact support (too many results returned)',
                    });
                    return;
                }

                //Retrieve the salt used to create the salted-hash provided from the DB
                const salt = result.rows[0].salt;

                //Retrieve the salted-hash password provided from the DB
                const storedSaltedHash = result.rows[0].salted_hash;

                //Generate a hash based on the stored salt and the provided password
                const providedSaltedHash = generateHash(
                    request.body.currentpassword,
                    salt
                );

                //Did our salted hash match their salted hash?
                if (storedSaltedHash === providedSaltedHash) {
                    //credentials match. Salt and hash the new password
                    const newSalt = generateSalt(32);
                    const newSaltedHash = generateHash(
                        request.body.newPassword,
                        newSalt
                    );

                    const theQuery =
                        'UPDATE Account_Credential SET salted_hash = $2, salt = $3 WHERE account_id = $1';
                    const values = [request.claims.id, newSaltedHash, newSalt];
                    pool.query(theQuery, values).then(() => {
                        // const accessToken = jwt.sign(
                        //     {
                        //         role: request.body.role,
                        //         id: request.id,
                        //     },
                        //     key.secret,
                        //     {
                        //         expiresIn: '14 days', // expires in 14 days
                        //     }
                        // );
                        //We successfully added the user!
                        response.status(201).send({
                            // accessToken,
                            // id: request.id,
                            message: 'Password changed successfully',
                        });
                    });
                } else {
                    //credentials dod not match
                    response.status(400).send({
                        message: 'Credentials did not match',
                    });
                }
            })
            .catch((error) => {
                //log the error
                console.error('DB Query error on sign in');
                console.error(error);
                response.status(500).send({
                    message: 'server error 2 - contact support',
                });
            });
    }
);

// "return" the router
export { pwRouter };
