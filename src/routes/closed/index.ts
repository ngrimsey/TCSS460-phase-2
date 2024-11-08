import express, { Router } from 'express';

import { checkToken } from '../../core/middleware';
import { tokenTestRouter } from './tokenTest';
import { pwRouter } from './changePassword';

const closedRoutes: Router = express.Router();

closedRoutes.use(checkToken, tokenTestRouter, pwRouter);

export { closedRoutes };
