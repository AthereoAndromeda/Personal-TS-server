import buildServer, { BuildReturn } from "../src/server";
import fastify from "fastify";
import * as gql from "gql-query-builder";
import { mockDeep, mockReset } from "jest-mock-extended";
import { PrismaClient, Verse } from "@prisma/client";
import { DeepMockProxy } from "jest-mock-extended/lib/Mock";

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

        describe("GET /verses", () => {
            const expectedValue = verses;
            const errMsg = "Some Error";

            it("Success", async () => {
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

            it("Throws Error", async () => {
                app.db.verse.findMany.mockRejectedValue(errMsg);

                const res = await app.inject({
                    method: "GET",
                    url: "/verses",
                    headers: {
                        authorization: process.env.SERVER_AUTH,
                    },
                });

                expect(res.statusCode).toBe(500);
                expect(JSON.parse(res.payload)).toEqual({
                    error: "Internal Server Error",
                    message: errMsg,
                    statusCode: 500,
                });
            });
        });

        describe("GET /verses/:id", () => {
            const errMsg = "Some Error";

            it("Iterate over /verses/:id", async () => {
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
                    expect(JSON.parse(res.payload)).toEqualNullable(
                        expectedValue
                    );
                }
            });

            it("Throws Error", async () => {
                app.db.verse.findUnique.mockRejectedValue(errMsg);

                const res = await app.inject({
                    method: "GET",
                    url: `/verses/1`,
                    headers: {
                        authorization: process.env.SERVER_AUTH,
                    },
                });

                expect(res.statusCode).toBe(500);
                expect(JSON.parse(res.payload)).toEqual({
                    error: "Internal Server Error",
                    message: errMsg,
                    statusCode: 500,
                });
            });
        });

        describe("POST /verses", () => {
            const expectedValue = verses[0];
            const errMsg = "Some Error";

            it("Success", async () => {
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

            it("Throws Error", async () => {
                app.db.verse.create.mockRejectedValue(errMsg);

                const res = await app.inject({
                    method: "POST",
                    url: "/verses",
                    headers: {
                        authorization: process.env.SERVER_AUTH,
                    },
                    payload: expectedValue,
                });

                expect(res.statusCode).toBe(500);
                expect(JSON.parse(res.payload)).toEqual({
                    error: "Internal Server Error",
                    message: errMsg,
                    statusCode: 500,
                });
            });
        });

        describe("PUT /verses", () => {
            const expectedValue = verses[0];
            const errMsg = "Some Error";

            it("Success", async () => {
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

            it("Throws Error", async () => {
                app.db.verse.update.mockRejectedValue(errMsg);

                const res = await app.inject({
                    method: "PUT",
                    url: "/verses",
                    headers: {
                        authorization: process.env.SERVER_AUTH,
                    },
                    payload: expectedValue,
                });

                expect(res.statusCode).toBe(500);
                expect(JSON.parse(res.payload)).toEqual({
                    error: "Internal Server Error",
                    message: errMsg,
                    statusCode: 500,
                });
            });
        });

        describe("PATCH /verses", () => {
            it.todo("Success");
            it.todo("Throws Error");
        });

        describe("DELETE /verses", () => {
            const expectedValue = verses[0];
            const payload = { id: expectedValue.id };
            const errMsg = "Some Error";

            it("Success", async () => {
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

            it("Throws Error", async () => {
                app.db.verse.delete.mockRejectedValue(errMsg);

                const res = await app.inject({
                    method: "DELETE",
                    url: "/verses",
                    headers: {
                        authorization: process.env.SERVER_AUTH,
                    },
                    payload,
                });

                expect(res.statusCode).toBe(500);
                expect(JSON.parse(res.payload)).toEqual({
                    error: "Internal Server Error",
                    message: errMsg,
                    statusCode: 500,
                });
            });
        });
    });

    describe("Test /graphql", () => {
        describe("Queries All Verses", () => {
            const expectedValue = verses;

            it("Return Success", async () => {
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

            it("Throw Error", async () => {
                const errMsg = "Error Test";
                app.db.verse.findMany.mockRejectedValue(errMsg);

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
                        verse: null,
                    },
                    errors: [
                        {
                            message: errMsg,
                            path: ["verse"],
                            locations: expect.arrayContaining([
                                {
                                    line: expect.any(Number),
                                    column: expect.any(Number),
                                },
                            ]),
                        },
                    ],
                });
            });
        });

        describe("Queries Specific Verse", () => {
            const expectedValue = verses[0];

            it("Return Success", async () => {
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

            it("Throws Error", async () => {
                const errMsg = "Error Test";
                app.db.verse.findUnique.mockRejectedValue(errMsg);

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
                    data: { verse: null },
                    errors: [
                        {
                            message: errMsg,
                            path: ["verse"],
                            locations: expect.arrayContaining([
                                {
                                    line: expect.any(Number),
                                    column: expect.any(Number),
                                },
                            ]),
                        },
                    ],
                });
            });
        });

        describe("Mutates single verse", () => {
            const expectedValue = verses[0];

            it("Return success", async () => {
                app.db.verse.upsert.mockResolvedValue(expectedValue);

                const payload = gql.mutation({
                    operation: "verse",
                    variables: {
                        id: {
                            value: expectedValue.id,
                            required: true,
                        },
                        title: {
                            value: expectedValue.title,
                            required: true,
                        },
                        content: {
                            value: expectedValue.content,
                            required: true,
                        },
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
                        verse: expectedValue,
                    },
                });
            });

            it("Throw error", async () => {
                const someValue = verses[0];
                const errMessage = "Error Test";
                app.db.verse.upsert.mockRejectedValue(errMessage);

                const payload = gql.mutation({
                    operation: "verse",
                    variables: {
                        id: {
                            value: someValue.id,
                            required: true,
                        },
                        title: {
                            value: someValue.title,
                            required: true,
                        },
                        content: {
                            value: someValue.content,
                            required: true,
                        },
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
                    data: { verse: null },
                    errors: [
                        {
                            message: errMessage,
                            path: ["verse"],
                            locations: expect.arrayContaining([
                                {
                                    line: expect.any(Number),
                                    column: expect.any(Number),
                                },
                            ]),
                        },
                    ],
                });
            });
        });
    });
});
