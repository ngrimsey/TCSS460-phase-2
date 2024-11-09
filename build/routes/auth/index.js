"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../../core/middleware");
const login_1 = require("./login");
const register_1 = require("./register");
const resetPassword_1 = require("./resetPassword");
const changePassword_1 = require("./changePassword");
const authRoutes = express_1.default.Router();
exports.authRoutes = authRoutes;
authRoutes.use(login_1.signinRouter, register_1.registerRouter, resetPassword_1.resetPWRouter);
authRoutes.use(middleware_1.checkToken, changePassword_1.changePWRouter);
//# sourceMappingURL=index.js.map