/* eslint-disable @typescript-eslint/ban-ts-comment */
import buildServer, { BuildReturn } from "../src/server";
import fastify, { InjectOptions } from "fastify";
import * as gql from "gql-query-builder";
import { mockDeep, mockReset } from "jest-mock-extended";
import { PrismaClient, Snipes, Verse } from "@prisma/client";
import { DeepMockProxy } from "jest-mock-extended/lib/Mock";
import "./helper";

// @ts-ignore Due to circular reference errors
interface MockServer extends BuildReturn {
    db: DeepMockProxy<PrismaClient>;
}

describe("Test App Endpoints", () => {
    let app: MockServer;
    const prismaMock = mockDeep<PrismaClient>();
    const errMsg = "Some Error";
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
    const injectOpts: InjectOptions = {
        method: "GET",
        url: "/verses",
        headers: {
            authorization: process.env.SERVER_AUTH,
            "content-type": "application/json",
        },
    };
    const noAPIKey = {
        statusCode: 401,
        error: "Unauthorized",
        message: "API Key Required",
    };
    const restErrObj = {
        error: "Internal Server Error",
        message: errMsg,
        statusCode: 500,
    };

    beforeAll(async () => {
        app = (await buildServer(fastify(), { db: prismaMock })) as MockServer;
    });

    afterEach(() => {
        mockReset(prismaMock);
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
        it("Return 401 Unauthorized", async () => {
            const deepCloneOpts = JSON.parse(JSON.stringify(injectOpts));
            deepCloneOpts.headers.authorization = "incorrect";
            const res = await app.inject(deepCloneOpts);

            expect(res.statusCode).toBe(401);
            expect(JSON.parse(res.payload)).toStrictEqual(noAPIKey);
        });

        describe("GET /verses", () => {
            const expectedValue = verses;

            it("Success", async () => {
                app.db.verse.findMany.mockResolvedValue(expectedValue);
                const res = await app.inject(injectOpts);

                expect(res.statusCode).toBe(200);
                expect(JSON.parse(res.payload)).toEqual(expectedValue);
            });

            it("Throws Error", async () => {
                app.db.verse.findMany.mockRejectedValue(errMsg);
                const res = await app.inject(injectOpts);

                expect(res.statusCode).toBe(500);
                expect(JSON.parse(res.payload)).toEqual(restErrObj);
            });
        });

        describe("GET /verses/:id", () => {
            const cloneOpts = { ...injectOpts };

            it("Iterate over /verses/:id", async () => {
                app.db.verse.findUnique
                    .mockResolvedValueOnce(verses[0])
                    .mockResolvedValueOnce(verses[1])
                    .mockResolvedValue(null);

                for (let i = 0; i < 3; i++) {
                    cloneOpts.url = `/verses/${i}`;
                    const expectedValue = verses[i] ? verses[i] : null;
                    const res = await app.inject(cloneOpts);

                    expect(res.statusCode).toBe(200);
                    expect(JSON.parse(res.payload)).toEqualNullable(
                        expectedValue
                    );
                }
            });

            it("Throws Error", async () => {
                app.db.verse.findUnique.mockRejectedValue(errMsg);
                const res = await app.inject(cloneOpts);

                expect(res.statusCode).toBe(500);
                expect(JSON.parse(res.payload)).toEqual(restErrObj);
            });
        });

        describe("POST /verses", () => {
            const expectedValue = verses[0];
            const cloneOpts = { ...injectOpts };
            cloneOpts.method = "POST";
            cloneOpts.payload = expectedValue;

            it("Success", async () => {
                app.db.verse.create.mockResolvedValue(expectedValue);
                const res = await app.inject(cloneOpts);

                expect(res.statusCode).toBe(200);
                expect(JSON.parse(res.payload)).toEqual(expectedValue);
            });

            it("Throws Error", async () => {
                app.db.verse.create.mockRejectedValue(errMsg);
                const res = await app.inject(cloneOpts);

                expect(res.statusCode).toBe(500);
                expect(JSON.parse(res.payload)).toEqual(restErrObj);
            });
        });

        describe("PUT /verses", () => {
            const expectedValue = verses[0];
            const cloneOpts = { ...injectOpts };
            cloneOpts.method = "PUT";
            cloneOpts.payload = expectedValue;

            it("Success", async () => {
                app.db.verse.update.mockResolvedValue(expectedValue);
                const res = await app.inject(cloneOpts);

                expect(res.statusCode).toBe(200);
                expect(JSON.parse(res.payload)).toEqual(expectedValue);
            });

            it("Throws Error", async () => {
                app.db.verse.update.mockRejectedValue(errMsg);
                const res = await app.inject(cloneOpts);

                expect(res.statusCode).toBe(500);
                expect(JSON.parse(res.payload)).toEqual(restErrObj);
            });
        });

        describe("PATCH /verses", () => {
            it.todo("Success");
            it.todo("Throws Error");
        });

        describe("DELETE /verses", () => {
            const expectedValue = verses[0];
            const payload = { id: expectedValue.id };
            const cloneOpts = { ...injectOpts };
            cloneOpts.method = "DELETE";
            cloneOpts.payload = payload;

            it("Success", async () => {
                app.db.verse.delete.mockResolvedValue(expectedValue);
                const res = await app.inject(cloneOpts);

                expect(res.statusCode).toBe(200);
                expect(JSON.parse(res.payload)).toEqual(expectedValue);
            });

            it("Throws Error", async () => {
                app.db.verse.delete.mockRejectedValue(errMsg);
                const res = await app.inject(cloneOpts);

                expect(res.statusCode).toBe(500);
                expect(JSON.parse(res.payload)).toEqual(restErrObj);
            });
        });
    });

    describe("Test /snipes", () => {
        const expectedValue: Snipes = {
            id: 1,
            author: "Test Author",
            content: "Test Content",
        };

        describe("GET /snipes", () => {
            const cloneOpts = { ...injectOpts };
            cloneOpts.method = "GET";
            cloneOpts.url = "/snipes";

            it("Success", async () => {
                app.db.snipes.findFirst.mockResolvedValue(expectedValue);
                const res = await app.inject(cloneOpts);

                expect(res.statusCode).toBe(200);
                expect(JSON.parse(res.payload)).toEqualNullable(expectedValue);
            });

            it("Throw Error", async () => {
                app.db.snipes.findFirst.mockRejectedValue(errMsg);
                const res = await app.inject(cloneOpts);

                expect(res.statusCode).toBe(500);
                expect(JSON.parse(res.payload)).toEqual(restErrObj);
            });
        });
    });

    describe("Test /graphql", () => {
        const cloneOpts = { ...injectOpts };
        cloneOpts.method = "POST";
        cloneOpts.url = "/graphql";
        const errObj = {
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
        };

        it("Return Unauthorized", async () => {
            const payload = gql.query({
                operation: "verse",
                fields: ["id"],
            });

            const opts = JSON.parse(JSON.stringify(cloneOpts));
            opts.headers.authorization = "wrong";
            opts.payload = payload;

            const res = await app.inject(opts);

            expect(res.statusCode).toBe(500);
            expect(JSON.parse(res.payload)).toEqual({
                data: null,
                errors: [{ message: "401 Unauthorized" }],
            });
        });

        describe("Queries", () => {
            describe("All Verses", () => {
                const queryOpts = { ...cloneOpts };
                const payload = gql.query({
                    operation: "verse",
                    fields: ["id", "title", "content"],
                });
                queryOpts.payload = payload;
                const expectedValue = verses;

                it("Return Success", async () => {
                    app.db.verse.findMany.mockResolvedValue(expectedValue);
                    const res = await app.inject(queryOpts);

                    expect(res.statusCode).toBe(200);
                    expect(JSON.parse(res.payload)).toEqual({
                        data: { verse: expectedValue },
                    });
                });

                it("Throw Error", async () => {
                    app.db.verse.findMany.mockRejectedValue(errMsg);
                    const res = await app.inject(queryOpts);

                    expect(res.statusCode).toBe(200);
                    expect(JSON.parse(res.payload)).toEqual(errObj);
                });
            });

            describe("Specific Verse", () => {
                const expectedValue = verses[0];
                const payload = gql.query({
                    operation: "verse",
                    variables: {
                        id: 1,
                    },
                    fields: ["id", "title", "content"],
                });
                const queryOpts = { ...cloneOpts };
                queryOpts.payload = payload;

                it("Return Success", async () => {
                    app.db.verse.findUnique.mockResolvedValue(expectedValue);
                    const res = await app.inject(queryOpts);

                    expect(res.statusCode).toBe(200);
                    expect(JSON.parse(res.payload)).toEqual({
                        data: { verse: [expectedValue] },
                    });
                });

                it("Throw Error", async () => {
                    app.db.verse.findUnique.mockRejectedValue(errMsg);
                    const res = await app.inject(queryOpts);

                    expect(res.statusCode).toBe(200);
                    expect(JSON.parse(res.payload)).toEqual(errObj);
                });
            });
        });

        describe("Mutations", () => {
            describe("Mutates single verse", () => {
                const expectedValue = verses[0];
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
                const mutationOpts = { ...cloneOpts };
                mutationOpts.payload = payload;

                it("Return success", async () => {
                    app.db.verse.upsert.mockResolvedValue(expectedValue);
                    const res = await app.inject(mutationOpts);

                    expect(res.statusCode).toBe(200);
                    expect(JSON.parse(res.payload)).toEqual({
                        data: { verse: expectedValue },
                    });
                });

                it("Throw error", async () => {
                    app.db.verse.upsert.mockRejectedValue(errMsg);
                    const res = await app.inject(mutationOpts);

                    expect(res.statusCode).toBe(200);
                    expect(JSON.parse(res.payload)).toEqual(errObj);
                });
            });
        });
    });
});
