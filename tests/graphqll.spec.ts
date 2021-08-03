import buildServer from "../src/server";
import fastify, { FastifyInstance } from "fastify";
import * as gql from "gql-query-builder";

describe("Test /graphql Endpoint", () => {
    let app: FastifyInstance;
    // Start Server and connect to DB
    beforeAll(async () => {
        app = await buildServer(fastify());

        await app.db.$connect();
        await app.listen(8083, "0.0.0.0");
        return;
    }, 300000);

    // Stop Server and disconnect DB
    afterAll(async () => {
        await app.close();
        await app.db.$disconnect();
        return;
    }, 300000);

    it("Queries All Verses", async () => {
        const payload = gql.query({
            operation: "verse",
            fields: ["id", "title", "content"],
        });

        const res = await app.inject({
            method: "POST",
            url: "/graphql",
            headers: {
                authorization: process.env.SERVER_AUTH,
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

        return;
    });

    it("Queries Specific Verse", async () => {
        const payload = gql.query({
            operation: "verse",
            variables: {
                id: 1,
            },
            fields: ["id", "title", "content"],
        });

        const res = await app.inject({
            method: "POST",
            url: "/graphql",
            headers: {
                authorization: process.env.SERVER_AUTH,
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

        return;
    });
});
