import express, { Router } from 'express';

import { checkToken } from '../../core/middleware';
import { tokenTestRouter } from './tokenTest';
import { bookRouter } from './books';
import { messageRouter } from './closed_message';
import { addBooksRouter } from './addBooks'

const closedRoutes: Router = express.Router();

closedRoutes.use('/books',checkToken, bookRouter);
closedRoutes.use('/jwt_test', checkToken, tokenTestRouter);
closedRoutes.use(checkToken, addBooksRouter);
//closedRoutes.use('/test', addBooksRouter);
closedRoutes.use('/c/message', checkToken, messageRouter);

export { closedRoutes };