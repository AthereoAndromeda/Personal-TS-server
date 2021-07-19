import { PrismaClient } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

interface PrismaPluginOptions {
    db: PrismaClient;
}

const prismaPlugin: FastifyPluginAsync<PrismaPluginOptions> = fp(
    async (app, options) => {
        app.decorate("db", options.db);
        await app.db.$connect();
    }
);

export default prismaPlugin;
