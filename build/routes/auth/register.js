"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRouter = void 0;
// express is the framework we're going to use to handle requests
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const key = {
    secret: process.env.JSON_WEB_TOKEN,
};
const utilities_1 = require("../../core/utilities");
const isStringProvided = utilities_1.validationFunctions.isStringProvided;
const isNumberProvided = utilities_1.validationFunctions.isNumberProvided;
const isValidPassword = utilities_1.validationFunctions.isValidPassword;
const generateHash = utilities_1.credentialingFunctions.generateHash;
const generateSalt = utilities_1.credentialingFunctions.generateSalt;
const registerRouter = express_1.default.Router();
exports.registerRouter = registerRouter;
// Password validation
// Password must be at least 8 characters long and contain at least one
// uppercase letter, one lowercase letter, one number, and one special character(!, @, #, $, %, ^, &, *)
// const isValidPassword = (password: string): boolean =>
//     isStringProvided(password) &&
//     password.length > 7 &&
//     /[!@#$%^&*]/.test(password) &&
//     /[A-Z]/.test(password) &&
//     /[a-z]/.test(password) &&
//     /[0-9]/.test(password);
// Phone number validation
// Phone number must be at least 10 characters long and contain only numbers
const isValidPhone = (phone) => isNumberProvided(phone) && phone.length >= 10;
// Role validation
// Role must be a number between 1 and 3
// 1: Admin, 2: Mod, 3: User
const isValidRole = (priority) => utilities_1.validationFunctions.isNumberProvided(priority) &&
    parseInt(priority) >= 1 &&
    parseInt(priority) <= 3;
// Email validation
// Email must be a valid email address
const isValidEmail = (email) => isStringProvided(email) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    (email.endsWith('.com') ||
        email.endsWith('.edu') ||
        email.endsWith('.net') ||
        email.endsWith('.org'));
const emailMiddlewareCheck = (request, response, next) => {
    if (isValidEmail(request.body.email)) {
        next();
    }
    else {
        response.status(400).send({
            message: 'Invalid or missing email - please refer to documentation',
        });
    }
};
/**
 * @api {post} /register Request to register a user
 *
 * @apiDescription To register a user, you must provide the following information:
 * First name, last name, email, password, username, role, and phone number.
 *
 * Password rules:
 * - Must be at least 8 characters long
 * - Must contain at least one special character
 * - Must contain at least one capital letter
 * - Must contain at least one number
 *
 * Email rules:
 * - Must be a valid email address ending in .com, .edu, .net, or .org
 *
 * Phone rules:
 * - Must be a valid phone number
 * - Must be at least 10 characters long
 * - Must contain only numbers - no dashes or parentheses
 *
 * Role rules:
 * - Must be a number between 1 and 3
 *
 * @apiName PostRegister
 * @apiGroup Auth
 *
 * @apiBody {String} firstname a users first name
 * @apiBody {String} lastname a users last name
 * @apiBody {String} email a users email *unique
 * @apiBody {String} password a users password
 * @apiBody {String} username a username *unique
 * @apiBody {String} role a role for this user [1-3]
 * @apiBody {String} phone a phone number for this user *unique
 *
 * @apiSuccess (Success 201) {string} accessToken a newly created JWT
 * @apiSuccess (Success 201) {number} id unique user id
 *
 * @apiError (400: Missing Parameters) {String} message "Missing name or username"
 * @apiError (400: Invalid Password) {String} message "Invalid or missing password - please refer to documentation"
 * @apiError (400: Invalid Phone) {String} message "Invalid or missing phone number - please refer to documentation"
 * @apiError (400: Invalid Email) {String} message "Invalid or missing email - please refer to documentation"
 * @apiError (400: Invalid Role) {String} message "Invalid or missing role - please refer to documentation"
 * @apiError (400: Username exists) {String} message "Username exists"
 * @apiError (400: Email exists) {String} message "Email exists"
 * @apiError (400: Phone exists) {String} message "Phone number exists"
 *
 */
registerRouter.post('/register', emailMiddlewareCheck, (request, response, next) => {
    //Verify that the caller supplied all the parameters
    if (isStringProvided(request.body.firstname) &&
        isStringProvided(request.body.lastname) &&
        isStringProvided(request.body.username)) {
        next();
    }
    else {
        response.status(400).send({
            message: 'Missing name or username',
        });
    }
}, (request, response, next) => {
    if (isValidPhone(request.body.phone)) {
        next();
        return;
    }
    else {
        response.status(400).send({
            message: 'Invalid or missing phone number - please refer to documentation',
        });
        return;
    }
}, (request, response, next) => {
    if (isValidPassword(request.body.password)) {
        next();
    }
    else {
        response.status(400).send({
            message: 'Invalid or missing password - please refer to documentation',
        });
    }
}, (request, response, next) => {
    if (isValidRole(request.body.role)) {
        next();
    }
    else {
        response.status(400).send({
            message: 'Invalid or missing role - please refer to documentation',
        });
    }
}, (request, response, next) => {
    const theQuery = 'INSERT INTO Account(firstname, lastname, username, email, phone, account_role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING account_id';
    const values = [
        request.body.firstname,
        request.body.lastname,
        request.body.username,
        request.body.email,
        request.body.phone,
        request.body.role,
    ];
    utilities_1.pool.query(theQuery, values)
        .then((result) => {
        //stash the account_id into the request object to be used in the next function
        request.id = result.rows[0].account_id;
        next();
    })
        .catch((error) => {
        if (error.constraint == 'account_username_key') {
            response.status(400).send({
                message: 'Username exists',
            });
        }
        else if (error.constraint == 'account_email_key') {
            response.status(400).send({
                message: 'Email exists',
            });
        }
        else if (error.constraint == 'account_phone_key') {
            response.status(400).send({
                message: 'Phone number exists',
            });
        }
        else {
            //log the error
            console.error('DB Query error on register');
            console.error(error);
            response.status(500).send({
                message: 'server error - contact support',
            });
        }
    });
}, (request, response) => {
    const salt = generateSalt(32);
    const saltedHash = generateHash(request.body.password, salt);
    const theQuery = 'INSERT INTO Account_Credential(account_id, salted_hash, salt) VALUES ($1, $2, $3)';
    const values = [request.id, saltedHash, salt];
    utilities_1.pool.query(theQuery, values)
        .then(() => {
        const accessToken = jsonwebtoken_1.default.sign({
            role: request.body.role,
            id: request.id,
        }, key.secret, {
            expiresIn: '14 days', // expires in 14 days
        });
        //We successfully added the user!
        response.status(201).send({
            accessToken,
            id: request.id,
        });
    })
        .catch((error) => {
        // Deletes user with failed add
        const theQuery = 'DELETE FROM Account WHERE Username = $1 AND Email = $2';
        const values = [request.body.username, request.body.email];
        utilities_1.pool.query(theQuery, values);
        //log the error
        console.error('DB Query error on register');
        console.error(error);
        response.status(500).send({
            message: 'server error - contact support',
        });
    });
});
//# sourceMappingURL=register.js.map