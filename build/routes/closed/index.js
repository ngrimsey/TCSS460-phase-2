"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closedRoutes = void 0;
const express_1 = __importDefault(require("express"));
const middleware_1 = require("../../core/middleware");
const tokenTest_1 = require("./tokenTest");
const books_1 = require("./books");
const closed_message_1 = require("./closed_message");
const addBooks_1 = require("./addBooks");
const closedRoutes = express_1.default.Router();
exports.closedRoutes = closedRoutes;
closedRoutes.use('/books', middleware_1.checkToken, books_1.bookRouter);
closedRoutes.use('/jwt_test', middleware_1.checkToken, tokenTest_1.tokenTestRouter);
closedRoutes.use(middleware_1.checkToken, addBooks_1.addBooksRouter);
//closedRoutes.use('/test', addBooksRouter);
closedRoutes.use('/c/message', middleware_1.checkToken, closed_message_1.messageRouter);
//# sourceMappingURL=index.js.map