import { PrismaClient } from "@prisma/client";
import fastify, { FastifyInstance } from "fastify";
import buildServer from "./server";
import { checkNodeEnv } from "./utils";

const app = fastify({
    logger: {
        prettyPrint: checkNodeEnv("development") ? true : false,
        file: checkNodeEnv("production") ? "./logs/combined.log" : undefined,
    },
});

/**
 * Starts the Server
 * @param app Fastify App
 */
async function start(app: FastifyInstance) {
    try {
        const { PORT } = process.env;
        if (!PORT) throw "Port Not Found";

        const prisma = new PrismaClient({
            log: checkNodeEnv("production")
                ? ["warn", "error"]
                : ["info", "query", "warn", "error"],
        });

        const server = await buildServer(app, { db: prisma });

        await server.db.$connect();
        await server.listen(PORT, "0.0.0.0");
        server.blipp();
    } catch (error) {
        app.log.error(error);
        app.close();
    }
}

start(app);
