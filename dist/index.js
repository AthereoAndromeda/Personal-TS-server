"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const server_1 = __importDefault(require("./server"));
const PrismaClient_1 = __importDefault(require("./schema/PrismaClient"));
const utils_1 = require("./utils");
const app = fastify_1.default({
    logger: {
        prettyPrint: utils_1.checkNodeEnv("development") ? true : false,
    },
});
/**
 * Starts the Server
 * @param app Fastify App
 */
async function start(app) {
    try {
        const { PORT } = process.env;
        if (!PORT)
            throw "Port Not Found";
        const server = await server_1.default(app, { prisma: PrismaClient_1.default });
        await server.listen(PORT, "0.0.0.0");
    }
    catch (error) {
        app.log.error(error);
        app.close();
    }
}
start(app);
