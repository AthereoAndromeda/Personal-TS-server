import buildServer from "../src/server";
import fastify, { FastifyInstance } from "fastify";
import prisma from "../src/schema/PrismaClient";
import dotenv from "dotenv";
dotenv.config();

let app1: FastifyInstance;
let prisma1 = prisma;

describe("Test Authorization", () => {
    // Start Server and connect to DB
    beforeAll(async () => {
        app1 = await buildServer(fastify(), { prisma: prisma1 });
        await app1.listen(8081, "0.0.0.0");
        return Promise.resolve();
    });

    // Stop Server and disconnect DB
    afterAll(async () => {
        await app1.close();
        await prisma1.$disconnect();

        return Promise.resolve();
    });

    it("Should Return 401 Unauthorized: Incorrect Auth Key", async () => {
        const res = await app1.inject({
            method: "GET",
            url: "/",
            headers: {
                Authorization: "incorrectAuthorizationKey",
            },
        });

        expect(res.statusCode).toEqual(401);

        return Promise.resolve();
    });

    it("Should Return 401 Unauthorized: No Auth Key", async () => {
        const res = await app1.inject({
            method: "GET",
            url: "/",
        });

        expect(res.statusCode).toEqual(401);

        return Promise.resolve();
    });

    it("Should Return 200 Success", async () => {
        const res = await app1.inject({
            method: "GET",
            url: "/",
            headers: {
                Authorization: process.env.SERVER_AUTHKEY,
            },
        });

        expect(res.statusCode).toEqual(200);

        return Promise.resolve();
    });
});
