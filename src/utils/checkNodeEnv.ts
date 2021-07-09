/**
 * Checks for Node Environment
 * @param env Node Environment
 * @returns
 */
export function checkNodeEnv(env: NodeJS.ProcessEnv["NODE_ENV"]): boolean {
    return env === process.env.NODE_ENV;
}
