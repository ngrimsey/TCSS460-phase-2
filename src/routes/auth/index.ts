import express, { Router } from 'express';

import { signinRouter } from './login';
import { registerRouter } from './register';
import { resetPWRouter } from './resetPassword';

const authRoutes: Router = express.Router();

authRoutes.use(signinRouter, registerRouter, resetPWRouter);

export { authRoutes };
