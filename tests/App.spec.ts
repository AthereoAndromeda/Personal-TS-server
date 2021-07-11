import buildServer from "../src/server";
import fastify, { FastifyInstance } from "fastify";
import prisma from "../src/schema/PrismaClient";

let app1: FastifyInstance;
let prisma1 = prisma;

describe("Test Authorization", () => {
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

    it("Should Return 401 Unauthorized: Incorrect Auth Key", async () => {
        const res = await app1.inject({
            method: "GET",
            url: "/",
            headers: {
                authorization: "incorrectAuthorizationKey",
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
            url: "/verse",
            headers: {
                authorization: process.env.SERVER_AUTHKEY,
            },
        });

        expect(res.statusCode).toEqual(200);

        return Promise.resolve();
    });
});

let endpointApp: FastifyInstance;
let endpointPrisma = prisma;

describe("Hit Endpoints for Any Response", () => {
    beforeAll(async () => {
        endpointApp = await buildServer(fastify(), { prisma: prisma1 });
        await endpointApp.listen(8010, "0.0.0.0");
        return Promise.resolve();
    }, 300000);

    // Stop Server and disconnect DB
    afterAll(async () => {
        await endpointApp.close();
        await endpointPrisma.$disconnect();
        return Promise.resolve();
    }, 300000);

    it("Hit /", async () => {
        const res = await endpointApp.inject({
            method: "GET",
            url: "/",
            headers: {
                authorization: process.env.SERVER_AUTHKEY,
            },
        });

        expect(res.statusCode).not.toEqual(404);
        expect(res.payload).toEqual(expect.any(String));

        return Promise.resolve();
    });

    it("Hit /verse", async () => {
        const res = await endpointApp.inject({
            method: "GET",
            url: "/verse",
            headers: {
                authorization: process.env.SERVER_AUTHKEY,
            },
        });

        expect(res.statusCode).not.toEqual(404);
        expect(res.payload).toEqual(expect.anything());

        return Promise.resolve();
    });

    it("Hit /graphql", async () => {
        const res = await endpointApp.inject({
            method: "POST",
            url: "/graphql",
            headers: {
                authorization: process.env.SERVER_AUTHKEY,
            },
        });

        expect(res.statusCode).not.toEqual(404);
        expect(res.payload).toEqual(expect.anything());

        return Promise.resolve();
    });
});
