import buildServer, { BuildReturn } from "../src/server";
import fastify from "fastify";
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

const okObject = {
    message: () => "Ok",
    pass: true,
};

expect.extend({
    expectedOrNull(received, arg) {
        if (received === null) {
            return okObject;
        } else if (this.equals(received, arg)) {
            return okObject;
        } else {
            return {
                message: () => `expected ${received} to be ${arg}`,
                pass: false,
            };
        }
    },
});

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        interface Matchers<R extends void | Promise<void>> {
            expectedOrNull<E = unknown>(a: E): R;
        }
    }
}

describe("Test /verses Endpoint", () => {
    let app: MockServer;
    const prismaMock = mockDeep<PrismaClient>();

    beforeAll(async () => {
        app = (await buildServer(fastify())) as MockServer;
        // app.db = prismaMock;
    }, 300000);

    beforeEach(() => {
        app.db = prismaMock;
    });

    afterEach(() => {
        mockReset(app.db);
    });

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

    it("GET Should Fail Authentication", async () => {
        const expectedValue = {
            statusCode: 401,
            error: "Unauthorized",
            message: "API Key Required",
        };

        const res = await app.inject({
            method: "GET",
            url: "/verses",
        });

        expect(res.statusCode).toBe(401);
        expect(JSON.parse(res.payload)).toEqual(expectedValue);
    });

    it("GET Iterate over /verses/:id", async () => {
        app.db.verse.findUnique
            .mockResolvedValueOnce(verses[0])
            .mockResolvedValueOnce(verses[1])
            .mockResolvedValue(null);

        for (let i = 0; i < 3; i++) {
            const expectedValue = verses[i] ? verses[i] : null;
            console.log(expectedValue);

            const res = await app.inject({
                method: "GET",
                url: `/verses/${i}`,
                headers: {
                    authorization: process.env.SERVER_AUTH,
                },
            });

            expect(res.statusCode).toBe(200);
            expect(JSON.parse(res.payload)).expectedOrNull(expectedValue);
        }
    });
});
