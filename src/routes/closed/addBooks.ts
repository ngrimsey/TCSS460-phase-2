import express, { Request, Response, Router, NextFunction } from 'express';
import { checkToken } from '../../core/middleware';



const addBooksRouter: Router = express.Router();

import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';


const format = (resultRow) => ({
    ...resultRow,
    formatted: `{${resultRow.priority}} - [${resultRow.name}] says: ${resultRow.message}`,
});

const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;

// ISBN validation
// No arguments yet
const isValidISBN = (isbn : string): boolean =>
    isStringProvided(isbn);

// Author validation
// No arguments yet
const isValidAuthor = (author : string): boolean =>
    isStringProvided(author);

// Published year validation
// Needs to be 4 digits.
const isValidPublishYear = (year : string): boolean =>
    isNumberProvided(year) && /^\d{4}$/.test(year);

// Original title validation
// No arguments yet
const isValidOrigTitle = (origTitle : string): boolean =>
    isStringProvided(origTitle);

// Title validation
// No arguments yet
const isValidTitle = (title : string): boolean =>
    isStringProvided(title);

// NOTE
// ADD FOR ALL THE RATINGS?

addBooksRouter.get('/test', (req, res) => {
    res.send('Test route working');
});

/**
 * @api {post} /addbook Request to add a book
 *
 * @apiDescription To add a book, you must provide the following information:
 * ISBN, Author, Published year, Original Title, and Title.
 *
 * ISBN rules:
 *
 * Author rules:
 *
 * Published Year rules:
 * - Must be 4 digits.
 *
 * Original title rules:
 * 
 * Title rules:
 *
 * @apiName PostaddBook
 * @apiGroup closed
 *
 * @apiBody {String} isbn the ISBN of the book
 * @apiBody {String} author the author of the book
 * @apiBody {String} year the published year of the book
 * @apiBody {String} origTitle the original title of the book
 * @apiBody {String} title the title of the book
 *
 * @apiSuccess (Success 201) {string} accessToken a newly created JWT
 * @apiSuccess (Success 201) {number} id unique user id
 *
 * @apiError (400: Invalid ISBN) {String} message "Invalid or missing ISBN - please refer to documentation"
 * @apiError (400: Invalid Author Name) {String} message "Invalid or missing Author Name - please refer to documentation"
 * @apiError (400: Invalid Published Year) {String} message "Invalid or missing Published Year - please refer to documentation"
 * @apiError (400: Invalid Original Title) {String} message "Invalid or missing Original Title - please refer to documentation"
 * @apiError (400: Invalid Title) {String} message "Invalid or missing Title - please refer to documentation"
 * @apiError (400: Username exists) {String} message "Username exists"
 * @apiError (400: Email exists) {String} message "Email exists"
 * @apiError (400: Phone exists) {String} message "Phone number exists"
 *
 */
addBooksRouter.post(
    '/addbook',
    checkToken,
    (request: Request, response: Response, next: NextFunction) => {
        if(
            isValidISBN(request.body.isbn)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Invalid or Missing ISBN',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if(
            isValidAuthor(request.body.author)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Invalid or Missing Author Name',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if(
            isValidPublishYear(request.body.year)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Invalid or Missing Published Year',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if(
            isValidOrigTitle(request.body.origTitle)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Invalid or Missing Original Title',
            });
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if(
            isValidTitle(request.body.title)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Invalid or Missing Title',
            });
        }
    },
    // Insert to the database when all validations are cleared.
    async (request: Request, response: Response, next: NextFunction) => {
        const theQuery =
            'INSERT INTO books (isbn, author, publish_year, original_title, title) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const values = [
            request.body.isbn,
            request.body.author,
            request.body.publish_year,
            request.body.original_title,
            request.body.title,
        ];
        try {
            const result = await pool.query(theQuery, values);
            response.status(201).send({
                entry: format(result.rows[0]),
            });
        } catch (error) {
            if (error.detail && <string>error.detail.endsWith('exists.')) {
                console.error('Name exists');
                response.status(400).send({
                    message: 'Name exists',
                });
            } else {
                //log the error
                console.error('DB Query error on POST');
                console.error(error);
                response.status(500).send({
                    message: 'server error - contact support',
                });
            }
        }        
    }
);

export { addBooksRouter };