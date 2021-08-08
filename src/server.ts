import { FastifyInstance, FastifyLoggerInstance } from "fastify";
import fsp from "fs/promises";
import path from "path";
import gqlSchema from "./graphql";
import fastifyCors from "fastify-cors";
import { Route } from "typings";
import { checkNodeEnv } from "./utils";
import { IncomingMessage, Server, ServerResponse } from "http";
import fastifyBlipp from "fastify-blipp";
import fastifyHelmet from "fastify-helmet";
import prismaPlugin from "./plugins/prisma";
import fastifySensible from "fastify-sensible";
import mercurius from "mercurius";
import { PrismaClient } from "@prisma/client";

export interface BuildServerOptions {
    db: PrismaClient;
}

function registerPlugins(app: FastifyInstance, options: BuildServerOptions) {
    app.register(fastifyBlipp);

    app.register(fastifyHelmet);

    app.register(fastifySensible);

    app.register(mercurius, {
        schema: gqlSchema,
        context: (req, res) => ({
            req,
            res,
            db: options.db,
        }),
    }).after(() => {
        app.graphql.addHook("preParsing", async (schema, src, ctx) => {
            const authHeader = ctx.reply.request.headers.authorization;
            const isAuthorized = authHeader === process.env.SERVER_AUTH;

            if (!isAuthorized) {
                throw new Error("401 Unauthorized");
            }
        });
    });

    app.register(fastifyCors, {
        origin: "*",
    });

    if (checkNodeEnv("development")) {
        import("altair-fastify-plugin").then(data => {
            const Altair = data.default;
            app.register(Altair, {
                path: "/altair",
            });
        });
    }
}

function registerCustomPlugins(
    app: FastifyInstance,
    options: BuildServerOptions
) {
    app.register(prismaPlugin, { db: options.db });
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
    }
}

export type BuildReturn = FastifyInstance<
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
async function buildServer(
    app: FastifyInstance,
    options: BuildServerOptions
): Promise<BuildReturn> {
    try {
        registerPlugins(app, options); // 1
        registerCustomPlugins(app, options); // 2
        await registerRoutes(app); // 3

        await app.ready();
        return app;
    } catch (err) {
        app.log.error(err);
        throw new Error(err);
    }
}

export default buildServer;
