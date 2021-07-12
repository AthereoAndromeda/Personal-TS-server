import { PrismaClient } from "@prisma/client";
import { FastifyPluginCallback } from "fastify";

export interface Route {
    path: string;
    route: FastifyPluginCallback;
}

declare module "fastify" {
    interface FastifyInstance {
        db: PrismaClient;
    }
}
