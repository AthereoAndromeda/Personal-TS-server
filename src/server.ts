import { FastifyInstance, FastifyLoggerInstance } from "fastify";
import fsp from "fs/promises";
import path from "path";
import gqlSchema from "./graphql";
import fastifyCors from "fastify-cors";
import mercurius from "mercurius";
import { Route } from "typings";
import { checkNodeEnv } from "./utils";
import { PrismaClient } from "@prisma/client";
import fastifyGracefulShutdown from "fastify-graceful-shutdown";
import { IncomingMessage, Server, ServerResponse } from "http";
import middiePlugin from "middie";

interface BuildServerOptions {
    prisma: PrismaClient;
}

async function registerPlugins(app: FastifyInstance, opts: BuildServerOptions) {
    const ctx = {
        db: opts.prisma,
    };

    await app.register(mercurius, {
        schema: gqlSchema,
        graphiql: "playground",
        context: () => ctx,
    });

    await app.register(middiePlugin);

    app.register(fastifyGracefulShutdown);

    await app.register(fastifyCors, {
        origin: "*",
    });

    if (checkNodeEnv("development")) {
        const Altair = (await import("altair-fastify-plugin")).default;

        await app.register(Altair, {
            path: "/altair",
        });
    }
}

async function registerRoutes(app: FastifyInstance) {
    // Checks for file that ends in `.ts` or `.js`
    const validFileRegex = /\.js$|\.ts$/;

    const FilesInRoutes = await fsp.readdir(
        path.resolve(__dirname, "./routes/")
    );

    const routeFiles = FilesInRoutes.filter(file => validFileRegex.test(file));

    for (const routeFile of routeFiles) {
        const routeImport = await import(`./routes/${routeFile}`);
        const { path, route }: Route = routeImport.default;

        app.register(route, { prefix: path });
        app.log.info(`[${routeFile}]: ${path}`);
    }
}

type BuildReturn = FastifyInstance<
    Server,
    IncomingMessage,
    ServerResponse,
    FastifyLoggerInstance
>;

/**
 * Build the Fastify Server
 * @param app Fastify app
 * @param opts Server Options
 * @returns Built Fastify App or Server
 */
export default async function buildServer(
    app: FastifyInstance,
    opts: BuildServerOptions
): Promise<BuildReturn> {
    try {
        await opts.prisma.$connect();
        await registerPlugins(app, opts);
        await registerRoutes(app);

        // TODO move somewhere else
        app.addHook("onRequest", (req, res, done) => {
            if (req.headers.authorization !== process.env.SERVER_AUTHKEY) {
                res.status(401).send("401 Unauthorized: Provide API Key");
                return;
            }

            done();
        });

        return app;
    } catch (err) {
        app.log.error(err);
        throw new Error(err);
    }
}
