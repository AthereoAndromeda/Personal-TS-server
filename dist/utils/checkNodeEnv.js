"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkNodeEnv = void 0;
/**
 * Checks for Node Environment
 * @param env Node Environment
 * @returns
 */
function checkNodeEnv(env) {
    return env === process.env.NODE_ENV;
}
exports.checkNodeEnv = checkNodeEnv;
