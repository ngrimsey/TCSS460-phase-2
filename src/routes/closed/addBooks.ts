import express, { Request, Response, Router, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

const addBooksRouter: Router = express.Router();

import {
    pool,
    validationFunctions,
    credentialingFunctions,
} from '../../core/utilities';

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
    
)