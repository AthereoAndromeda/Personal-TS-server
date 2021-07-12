import buildServer from "../src/server";
import fastify, { FastifyInstance } from "fastify";
import prisma from "../src/schema/PrismaClient";
import * as gql from "gql-query-builder";

describe("Test /graphql Endpoint", () => {
    let app2: FastifyInstance;
    // Start Server and connect to DB
    beforeAll(async () => {
        app2 = await buildServer(fastify(), { prisma });
        await app2.listen(8083, "0.0.0.0");
        return Promise.resolve();
    }, 300000);

    // Stop Server and disconnect DB
    afterAll(async () => {
        await app2.close();
        await prisma.$disconnect();

        return Promise.resolve();
    }, 300000);

    it("Queries All Verses", async () => {
        const payload = gql.query({
            operation: "verse",
            fields: ["id", "title", "content"],
        });

        const res = await app2.inject({
            method: "POST",
            url: "/graphql",
            headers: {
                authorization: process.env.SERVER_AUTHKEY,
            },
            payload,
        });

        const expected = {
            data: {
                verse: expect.arrayContaining([
                    {
                        id: expect.any(Number),
                        content: expect.any(String),
                        title: expect.any(String),
                    },
                ]),
            },
        };

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(expected);

        return Promise.resolve();
    });

    it("Queries Specific Verse", async () => {
        const payload = gql.query({
            operation: "verse",
            variables: {
                id: 1,
            },
            fields: ["id", "title", "content"],
        });

        const res = await app2.inject({
            method: "POST",
            url: "/graphql",
            headers: {
                authorization: process.env.SERVER_AUTHKEY,
            },
            payload,
        });

        const expected = {
            data: {
                verse: [
                    {
                        id: expect.any(Number),
                        content: expect.any(String),
                        title: expect.any(String),
                    },
                ],
            },
        };

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(expected);

        return Promise.resolve();
    });
});
