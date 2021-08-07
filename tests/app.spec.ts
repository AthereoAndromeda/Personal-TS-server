import buildServer, { BuildReturn } from "../src/server";
import fastify from "fastify";
import * as gql from "gql-query-builder";
import { mockDeep } from "jest-mock-extended";
import { PrismaClient, Verse } from "@prisma/client";
import { DeepMockProxy, mockReset } from "jest-mock-extended/lib/Mock";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Due to circular reference errors
interface MockServer extends BuildReturn {
    db: DeepMockProxy<PrismaClient>;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R extends void | Promise<void>> {
            /** Same as `toEqual()`, but allows null values*/
            toEqualNullable<E = unknown>(a: E): R;
        }
    }
}

const okObject = {
    message: () => "Ok",
    pass: true,
};

expect.extend({
    toEqualNullable(received, expected) {
        if (received === null) {
            return okObject;
        } else if (this.equals(received, expected)) {
            return okObject;
        } else {
            return {
                message: () => `expected ${received} to be ${expected}`,
                pass: false,
            };
        }
    },
});

describe("Test App Endpoints", () => {
    let app: MockServer;
    const verses: Verse[] = [
        {
            id: 1,
            content: "Test Content",
            title: "Test Title",
        },
        {
            id: 2,
            content: "Test Content 2",
            title: "Test Title 2",
        },
    ];

    // Start Server and connect to DB
    beforeAll(async () => {
        app = (await buildServer(fastify())) as MockServer;
        const prismaMock = mockDeep<PrismaClient>();

        app.db = prismaMock;
    });

    afterEach(() => {
        mockReset(app.db);
    });

    describe("Test /", () => {
        it("GET /", async () => {
            const res = await app.inject({
                method: "GET",
                url: "/",
            });

            expect(res.statusCode).toBe(200);
            expect(res.payload).toEqual(expect.anything());
        });
    });

    describe("Test /verses", () => {
        const noAPIKey = {
            statusCode: 401,
            error: "Unauthorized",
            message: "API Key Required",
        };

        it("Return 401 Unauthorized: No Auth Key", async () => {
            const res = await app.inject({
                method: "GET",
                url: "/verses",
            });

            expect(res.statusCode).toBe(401);
            expect(JSON.parse(res.payload)).toStrictEqual(noAPIKey);
        });

        it("Return 401 Unauthorized: Incorrect Auth Key", async () => {
            const res = await app.inject({
                method: "GET",
                url: "/verses",
                headers: {
                    authorization: "incorrectAuthorizationKey",
                },
            });

            expect(res.statusCode).toBe(401);
            expect(JSON.parse(res.payload)).toStrictEqual(noAPIKey);
        });

        it("GET /verses", async () => {
            const expectedValue = verses;
            app.db.verse.findMany.mockResolvedValue(expectedValue);

            const res = await app.inject({
                method: "GET",
                url: "/verses",
                headers: {
                    authorization: process.env.SERVER_AUTH,
                },
            });

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res.payload)).toEqual(expectedValue);
        });

        it("POST /verses", async () => {
            const expectedValue = verses[0];
            app.db.verse.create.mockResolvedValue(expectedValue);

            const res = await app.inject({
                method: "POST",
                url: "/verses",
                headers: {
                    authorization: process.env.SERVER_AUTH,
                },
                payload: expectedValue,
            });

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res.payload)).toEqual(expectedValue);
        });

        it("PUT /verses", async () => {
            const expectedValue = verses[0];
            app.db.verse.update.mockResolvedValue(expectedValue);

            const res = await app.inject({
                method: "PUT",
                url: "/verses",
                headers: {
                    authorization: process.env.SERVER_AUTH,
                },
                payload: expectedValue,
            });

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res.payload)).toEqual(expectedValue);
        });

        it.todo("PATCH /verses");

        it("DELETE /verses", async () => {
            const expectedValue = verses[0];
            const payload = { id: expectedValue.id };
            app.db.verse.delete.mockResolvedValue(expectedValue);

            const res = await app.inject({
                method: "DELETE",
                url: "/verses",
                headers: {
                    authorization: process.env.SERVER_AUTH,
                },
                payload,
            });

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res.payload)).toEqual(expectedValue);
        });

        it("GET Iterate over /verses/:id", async () => {
            app.db.verse.findUnique
                .mockResolvedValueOnce(verses[0])
                .mockResolvedValueOnce(verses[1])
                .mockResolvedValue(null);

            for (let i = 0; i < 3; i++) {
                const expectedValue = verses[i] ? verses[i] : null;

                const res = await app.inject({
                    method: "GET",
                    url: `/verses/${i}`,
                    headers: {
                        authorization: process.env.SERVER_AUTH,
                    },
                });

                expect(res.statusCode).toBe(200);
                expect(JSON.parse(res.payload)).toEqualNullable(expectedValue);
            }
        });
    });

    describe("Test /graphql", () => {
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
});
