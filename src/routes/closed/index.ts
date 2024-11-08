import express, { Router } from 'express';

import { checkToken } from '../../core/middleware';
import { tokenTestRouter } from './tokenTest';

const closedRoutes: Router = express.Router();

closedRoutes.use(checkToken, tokenTestRouter);

export { closedRoutes };
