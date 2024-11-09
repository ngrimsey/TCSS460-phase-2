"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBodyParamStrings = void 0;
const utilities_1 = require("../utilities");
// Middleware to check if required params exist in req.body as strings
// Usage: validateBodyParamStrings["param1", "param2"]
const validateBodyParamStrings = (requiredParams) => {
    return (req, res, next) => {
        const missingParams = [];
        requiredParams.forEach(param => {
            if (!utilities_1.validationFunctions.isStringProvided(req.body[param])) {
                missingParams.push(param);
            }
        });
        if (missingParams.length > 0) {
            const message = `Missing required information - ${missingParams.join(' + ')}`;
            return res.status(400).json({ message });
        }
        next();
    };
};
exports.validateBodyParamStrings = validateBodyParamStrings;
//# sourceMappingURL=paramaterChecks.js.map