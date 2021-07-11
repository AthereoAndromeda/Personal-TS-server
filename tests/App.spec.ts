import buildServer from "../src/server";
import fastify, { FastifyInstance } from "fastify";
import prisma from "../src/schema/PrismaClient";
import * as gql from "gql-query-builder";
import dotenv from "dotenv";
dotenv.config();

// Multiple app instances required due to parallel nature of Jest
let app1: FastifyInstance;
let app2: FastifyInstance;
let prisma1 = prisma;
let prisma2 = prisma;

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

describe("Test GraphQL Endpoint", () => {
    // Start Server and connect to DB
    beforeAll(async () => {
        app2 = await buildServer(fastify(), { prisma: prisma2 });
        await app2.listen(8083, "0.0.0.0");
        return Promise.resolve();
    });

    // Stop Server and disconnect DB
    afterAll(async () => {
        await app2.close();
        await prisma2.$disconnect();

        return Promise.resolve();
    });

    it("Query: Get All Verses", async () => {
        const payload = gql.query({
            operation: "verse",
            fields: ["id", "title", "content"],
        });

        const res = await app2.inject({
            method: "POST",
            url: "/graphql",
            headers: {
                Authorization: process.env.SERVER_AUTHKEY,
            },
            payload,
        });

        const expected = {
            data: {
                verse: expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        content: expect.any(String),
                        title: expect.any(String),
                    }),
                ]),
            },
        };

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(expected);

        return Promise.resolve();
    });
});
