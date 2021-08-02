import buildServer, { BuildReturn } from "../src/server";
import fastify from "fastify";
import { mockDeep, MockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
interface MockServer extends BuildReturn {
    db: MockProxy<PrismaClient>;
}

describe("Test Authorization and Response", () => {
    let app: MockServer;

    // Start Server and connect to DB
    beforeAll(async () => {
        app = (await buildServer(fastify())) as MockServer;
        const prismaMock = mockDeep<PrismaClient>();

        app.db = prismaMock;

        await app.db.$connect();
        await app.listen(8081, "0.0.0.0");
        return;
    }, 300000);

    // Stop Server and disconnect DB
    afterAll(async () => {
        await app.db.$disconnect();
        await app.close();

        return;
    }, 300000);

    it("Should Return 200 Success to all Requests", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/",
        });

        expect(res.statusCode).toEqual(200);
        expect(res.payload).toEqual(expect.anything());

        return;
    });

    it("Should Return 401 Unauthorized: Incorrect Auth Key", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/verses",
            headers: {
                authorization: "incorrectAuthorizationKey",
            },
        });

        expect(res.statusCode).toEqual(401);
        expect(res.payload).toEqual(expect.anything());

        return;
    });

    it("Should Return 401 Unauthorized: No Auth Key", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/verses",
        });

        expect(res.statusCode).toEqual(401);
        expect(res.payload).toEqual(expect.anything());

        return;
    });

    it("Should Return 200 Success: Correct Auth Key", async () => {
        const expectedValue = [
            {
                id: 1,
                title: "Test Title",
                content: "Test Content",
            },
        ];

        app.db.verse.findMany.mockResolvedValue(expectedValue);

        const res = await app.inject({
            method: "GET",
            url: "/verses",
            headers: {
                authorization: process.env.SERVER_AUTH,
            },
        });

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(expectedValue);

        return;
    });
});
