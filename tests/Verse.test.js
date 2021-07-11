const buildServer = require("../dist/server.js").default;
const fastify = require("fastify")();
const prisma = require("../dist/schema/PrismaClient").default;
const axios = require("axios");
const gql = require("gql-query-builder");
require("dotenv").config();

let app;

describe("Test /verse", () => {
    beforeAll(async () => {
        app = await buildServer(fastify, { prisma });
        await app.listen(8080, "0.0.0.0");
        return Promise.resolve();
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();

        return Promise.resolve();
    });

    it("Get all Verses", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/verse",
        });

        const expected = expect.arrayContaining([
            expect.objectContaining({
                id: expect.any(Number),
                content: expect.any(String),
                title: expect.any(String),
            }),
        ]);

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(expected);

        return Promise.resolve();
    });

    it("Get specific verses", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/verse/1",
        });

        const expected = expect.objectContaining({
            id: expect.any(Number),
            content: expect.any(String),
            title: expect.any(String),
        });

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(expected);
        return Promise.resolve();
    });

    it("GraphQL Verse", async () => {
        const payload = gql.query({
            operation: "verse",
            fields: ["id", "title", "content"],
        });

        console.log(payload);

        const res = await app.inject({
            method: "POST",
            url: "/graphql",
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

        console.log(res.payload);

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(expected);

        return Promise.resolve();
    });
});
