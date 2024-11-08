import express, { Router } from 'express';

import { checkToken } from '../../core/middleware';
import { tokenTestRouter } from './tokenTest';
import { addBooksRouter } from './addBooks'

const closedRoutes: Router = express.Router();

closedRoutes.use('/jwt_test', checkToken, tokenTestRouter);
closedRoutes.use(checkToken, addBooksRouter);
//closedRoutes.use('/test', addBooksRouter);

export { closedRoutes };
