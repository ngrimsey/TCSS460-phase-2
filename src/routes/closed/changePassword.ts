//express is the framework we're going to use to handle requests
import express, { NextFunction, Response, Router } from 'express';
//Access the connection to Postgres Database
import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';
import { IJwtRequest } from '../../core/models';

const pwRouter: Router = express.Router();

const isStringProvided = validationFunctions.isStringProvided;
const isValidPassword = validationFunctions.isValidPassword;
const generateHash = credentialingFunctions.generateHash;
const generateSalt = credentialingFunctions.generateSalt;

/**
 * @apiDefine JWT
 * @apiHeader {String} Authorization The string "Bearer " + a valid JSON Web Token (JWT).
 */

/**
 * @api {put} /c/changePassword Request to change a user's password
 *
 * @apiDescription Request to change a user's password in the DB
 * - Requires a JWT obtained from /auth/login
 * - Requires the user's current password and the desired new password
 *
 * Password rules:
 * - Must be at least 8 characters long
 * - Must contain at least one special character
 * - Must contain at least one capital letter
 * - Must contain at least one number
 *
 * @apiName ClosedPutPassword
 * @apiGroup Closed
 *
 * @apiUse JWT
 *
 * @apiBody {string} currentpassword the user's current password
 * @apiBody {string} newpassword the user's new password
 *
 * @apiSuccess (204: Password changed successfully) {void} - no content
 *
 * @apiError (400: Missing currrent password) {String} message "Missing current password - please refer to documentation"
 * @apiError (400: Invalid Password) {String} message "Invalid or missing new password  - please refer to documentation"
 * @apiError (404: User Not Found) {String} message "User not found"
 * @apiError (400: Invalid Credentials) {String} message "Incorrect password"
 */

pwRouter.put(
    '/changePassword',
    (request: IJwtRequest, response: Response, next: NextFunction) => {
        if (isStringProvided(request.body.currentpassword)) {
            next();
        } else {
            response.status(400).send({
                message:
                    'Missing current password - please refer to documentation',
            });
        }
    },
    (request: IJwtRequest, response: Response, next: NextFunction) => {
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
        const theID = request.claims.id;
        const theQuery = `SELECT salted_hash, salt 
                      FROM Account_Credential
                      WHERE account_id = $1`;
        const values = [theID];
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
                    // Update the user's password information
                    const theNextQuery =
                        'UPDATE Account_Credential SET salted_hash = $1, salt = $2 WHERE account_id = $3';
                    const newValues = [newSaltedHash, newSalt, theID];
                    pool.query(theNextQuery, newValues)
                        .then(() => {
                            response.status(204).send();
                        })
                        .catch((error) => {
                            //log the error
                            console.error('DB Query error on sign in');
                            console.error(error);
                            response.status(500).send({
                                message: 'server error - contact support',
                            });
                        });
                } else {
                    //credentials did not match
                    response.status(400).send({
                        message: 'Incorrect password',
                    });
                }
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

// "return" the router
export { pwRouter };
