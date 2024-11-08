import express, { Router } from 'express';

import { checkToken } from '../../core/middleware';
import { tokenTestRouter } from './tokenTest';
import { bookRouter } from './books';

const closedRoutes: Router = express.Router();

closedRoutes.use('/books',checkToken, bookRouter);
closedRoutes.use('/jwt_test', checkToken, tokenTestRouter);
export { closedRoutes };
