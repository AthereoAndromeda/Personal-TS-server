import fastify, { FastifyInstance } from "fastify";
import buildServer from "./server";
import { checkNodeEnv } from "./utils";

const app = fastify({
    logger: {
        prettyPrint: checkNodeEnv("development") ? true : false,
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

        const server = await buildServer(app);

        await server.db.$connect();
        await server.listen(PORT, "0.0.0.0");
        server.blipp();
    } catch (error) {
        app.log.error(error);
        app.close();
    }
}

start(app);
