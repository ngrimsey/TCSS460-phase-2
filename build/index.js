
"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express_1 = __importDefault(require("express"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cors_1 = __importDefault(require("cors"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const routes_1 = require("./routes");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT) || 4001;
app.use((0, cors_1.default)());
/*
 * This middleware function parses JASON in the body of POST requests
 */
app.use(express_1.default.json());
app.use(routes_1.routes);
app.get('/', (request, response) => {
    response.send('Hello World!');
});
app.listen(PORT, () => {
    return console.log(`Express is listening at http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map