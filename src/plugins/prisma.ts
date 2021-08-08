import { PrismaClient } from "@prisma/client";
import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
    interface FastifyInstance {
        db: PrismaClient;
    }
}

export interface PrismaPluginOptions {
    db: PrismaClient;
}

const prismaPlugin: FastifyPluginAsync<PrismaPluginOptions> = fp(
    async (app, options) => {
        // Had to use getter/setter syntax since Fastify wont store mock
        // objects for tests when using normal ones. It would return undefined.
        //
        // This is because mock properties are created using `Object.defineProperty()`
        // which are non-enumerable by default which prevents Fastify from storing it.
        // Fastify uses `instance[name] = fn`
        //
        // Check this to see what I mean
        // https://github.com/fastify/fastify/blob/c21990d5d7036273fed37eacf4b87a29ae8db6b1/lib/decorate.js#L20
        app.decorate("db", {
            getter() {
                return options.db;
            },
        });
    }
);

export default prismaPlugin;
