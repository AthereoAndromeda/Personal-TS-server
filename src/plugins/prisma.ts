import { PrismaClient } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
    interface FastifyInstance {
        db: PrismaClient;
    }
}

interface PrismaPluginOptions {
    db?: PrismaClient;
}

const prismaPlugin: FastifyPluginAsync<PrismaPluginOptions> = fp(
    async (app, options) => {
        if (options.db) {
            app.decorate("db", options.db);
        } else {
            app.decorate("db", new PrismaClient());
        }
    }
);

export default prismaPlugin;
