import { FastifyInstance, FastifyLoggerInstance } from "fastify";
import fs from "fs";
import path from "path";
import gqlSchema from "./graphql";
import fastifyCors from "fastify-cors";
import mercurius from "mercurius";
import { Route } from "typings";
import { checkNodeEnv } from "./utils";
import { PrismaClient } from "@prisma/client";
import fastifyGracefulShutdown from "fastify-graceful-shutdown";
import { IncomingMessage, Server, ServerResponse } from "http";

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

    const FilesInRoutes = await fs.promises.readdir(
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

type BuildReturn = Promise<
    FastifyInstance<
        Server,
        IncomingMessage,
        ServerResponse,
        FastifyLoggerInstance
    >
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
): BuildReturn {
    try {
        await opts.prisma.$connect();
        await registerPlugins(app, opts);
        await registerRoutes(app);

        return app;
    } catch (err) {
        app.log.error(err);
        throw new Error(err);
    }
}
