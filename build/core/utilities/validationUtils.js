"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationFunctions = void 0;
/**
 * Checks the parameter to see if it is a a String.
 *
 * @param {any} candidate the value to check
 * @returns true if the parameter is a String0, false otherwise
 */
function isString(candidate) {
    return typeof candidate === 'string';
}
/**
 * Checks the parameter to see if it is a a String with a length greater than 0.
 *
 * @param {any} candidate the value to check
 * @returns true if the parameter is a String with a length greater than 0, false otherwise
 */
function isStringProvided(candidate) {
    return isString(candidate) && candidate.length > 0;
}
/**
 * Checks the parameter to see if it can be converted into a number.
 *
 * @param {any} candidate the value to check
 * @returns true if the parameter is a number, false otherwise
 */
function isNumberProvided(candidate) {
    return (isNumber(candidate) ||
        (candidate != null &&
            candidate != '' &&
            !isNaN(Number(candidate.toString()))));
}
/**
 * Checks the parameter to see if it is a valid password.
 *
 * @param {any} candidate the value to check
 * @returns true if the parameter is a valid password, false otherwise
 */
function isValidPassword(candidate) {
    return (isStringProvided(candidate) &&
        candidate.length > 7 &&
        /[!@#$%^&*]/.test(candidate) &&
        /[A-Z]/.test(candidate) &&
        /[a-z]/.test(candidate) &&
        /[0-9]/.test(candidate));
}
/**
 * Helper
 * @param x data value to check the type of
 * @returns true if the type of x is a number, false otherise
 */
function isNumber(x) {
    return typeof x === 'number';
}
const validationFunctions = {
    isStringProvided,
    isNumberProvided,
    isValidPassword,
};
exports.validationFunctions = validationFunctions;
//# sourceMappingURL=validationUtils.js.map