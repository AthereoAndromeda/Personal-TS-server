import buildServer from "../src/server";
import fastify, { FastifyInstance } from "fastify";
import prisma from "../src/schema/PrismaClient";

describe("Test Authorization and Response", () => {
    let app1: FastifyInstance;
    const prisma1 = prisma;

    // Start Server and connect to DB
    beforeAll(async () => {
        app1 = await buildServer(fastify(), { prisma: prisma1 });
        await app1.listen(8081, "0.0.0.0");
        return Promise.resolve();
    }, 300000);

    // Stop Server and disconnect DB
    afterAll(async () => {
        await app1.close();
        await prisma1.$disconnect();

        return Promise.resolve();
    }, 300000);

    it("Should Return 200 Success to all Requests", async () => {
        const res = await app1.inject({
            method: "GET",
            url: "/",
        });

        expect(res.statusCode).toEqual(200);
        expect(res.payload).toEqual(expect.anything());

        return Promise.resolve();
    });

    it("Should Return 401 Unauthorized: Incorrect Auth Key", async () => {
        const res = await app1.inject({
            method: "GET",
            url: "/verses",
            headers: {
                authorization: "incorrectAuthorizationKey",
            },
        });

        expect(res.statusCode).toEqual(401);
        expect(res.payload).toEqual(expect.anything());

        return Promise.resolve();
    });

    it("Should Return 401 Unauthorized: No Auth Key", async () => {
        const res = await app1.inject({
            method: "GET",
            url: "/verses",
        });

        expect(res.statusCode).toEqual(401);
        expect(res.payload).toEqual(expect.anything());

        return Promise.resolve();
    });

    it("Should Return 200 Success: Correct Auth Key", async () => {
        const res = await app1.inject({
            method: "GET",
            url: "/verses",
            headers: {
                authorization: process.env.SERVER_AUTH,
            },
        });

        expect(res.statusCode).toEqual(200);
        expect(res.payload).toEqual(expect.anything());

        return Promise.resolve();
    });
});
