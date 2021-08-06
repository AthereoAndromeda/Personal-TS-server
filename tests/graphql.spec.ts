import buildServer, { BuildReturn } from "../src/server";
import fastify from "fastify";
import * as gql from "gql-query-builder";
import {
    DeepMockProxy,
    mockDeep,
    mockReset,
} from "jest-mock-extended/lib/Mock";
import { PrismaClient, Verse } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Due to circular reference errors
interface MockServer extends BuildReturn {
    db: DeepMockProxy<PrismaClient>;
}

describe("Test /graphql Endpoint", () => {
    let app: MockServer;
    const prismaMock = mockDeep<PrismaClient>();
    const verses: Verse[] = [
        {
            id: 1,
            title: "Test Title",
            content: "Test Content",
        },
        {
            id: 2,
            title: "Test Title 2",
            content: "Test Content 2",
        },
    ];

    beforeAll(async () => {
        app = (await buildServer(fastify())) as MockServer;
        app.db = prismaMock;
    });

    beforeEach(() => {
        app.db = prismaMock;
    });

    afterEach(() => {
        mockReset(app.db);
    });

    it("Queries All Verses", async () => {
        const expectedValue = verses;
        app.db.verse.findMany.mockResolvedValue(expectedValue);

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

        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toEqual({
            data: {
                verse: expectedValue,
            },
        });
    });

    it("Queries Specific Verse", async () => {
        const expectedValue = verses[0];
        app.db.verse.findUnique.mockResolvedValue(expectedValue);

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

        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.payload)).toEqual({
            data: {
                verse: [expectedValue],
            },
        });
    });
});
