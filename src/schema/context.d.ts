import { PrismaClient } from "@prisma/client";
import { FastifyRequest, FastifyReply } from "fastify";

export interface Context {
    db: PrismaClient;
    req: FastifyRequest;
    res: FastifyReply;
}
