import express, { Request, Response, Router, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

const addBooksRouter: Router = express.Router();

import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';
import { IUserRequest } from '../auth/register';

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
// No arguments yet
const isValidPublishYear = (year : string): boolean =>
    isNumberProvided(year);

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

addBooksRouter.post(
    '/addbook',
    (request: Request, response: Response, next: NextFunction) => {
        if(
            isValidISBN(request.body.isbn)
        ) {
            next();
        } else {
            response.status(400).send({
                message: 'Invalid ISBN',
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
                message: 'Invalid Author Name',
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
                message: 'Invalid Published Year',
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
                message: 'Invalid Original Title',
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
                message: 'Invalid Title',
            });
        }
    },
    // Insert to the database when all validations are cleared.
    async (request: IUserRequest, response: Response, next: NextFunction) => {
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