import express, { Router } from 'express';

import { checkToken } from '../../core/middleware';
import { signinRouter } from './login';
import { registerRouter } from './register';
import { resetPWRouter } from './resetPassword';
import { changePWRouter } from './changePassword';

const authRoutes: Router = express.Router();

authRoutes.use(signinRouter, registerRouter, resetPWRouter);
authRoutes.use(checkToken, changePWRouter);

export { authRoutes };
