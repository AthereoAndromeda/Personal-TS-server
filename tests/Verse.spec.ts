import buildServer from "../src/server";
import fastify, { FastifyInstance } from "fastify";
import prisma from "../src/schema/PrismaClient";

const okObject = {
    message: () => "Ok",
    pass: true,
};

expect.extend({
    expectedOrNull(received, arg) {
        if (received === null) {
            return okObject;
        } else if (received.id) {
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
        interface Matchers<R> {
            expectedOrNull(a: any): typeof okObject;
        }
    }
}

describe("Test /verses Endpoint", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        const { id, content, title } = {
            id: 70,
            content: "asaas",
            title: "yeet",
        };

        app = await buildServer(fastify(), { prisma });
        await prisma.verse.upsert({
            where: {
                id,
            },
            create: {
                id,
                content,
                title,
            },
            update: {
                id,
                content,
                title,
            },
        });

        await app.listen(8069, "0.0.0.0");
        return Promise.resolve();
    }, 300000);

    afterAll(async () => {
        await app.close();

        await prisma.verse.delete({
            where: {
                id: 69,
            },
        });

        await prisma.$disconnect();

        return Promise.resolve();
    }, 300000);

    it("GET /verses", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/verses",
            headers: {
                authorization: process.env.SERVER_AUTH,
            },
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

    it("POST /verses", async () => {
        const payload = {
            id: 69,
            title: "nice",
            content: "i know very mature",
        };
        const res = await app.inject({
            method: "POST",
            url: "/verses",
            headers: {
                authorization: process.env.SERVER_AUTH,
            },
            payload,
        });

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(payload);

        return Promise.resolve();
    });

    it("PUT /verses", async () => {
        const payload = {
            id: 2,
            title: "PUT Test",
            content: "Content",
        };

        const res = await app.inject({
            method: "PUT",
            url: "/verses",
            headers: {
                authorization: process.env.SERVER_AUTH,
            },
            payload,
        });

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(payload);

        return Promise.resolve();
    });

    it.todo("PATCH /verses");

    it("DELETE /verses", async () => {
        const payload = {
            id: 70,
        };

        const res = await app.inject({
            method: "DELETE",
            url: "/verses",
            headers: {
                authorization: process.env.SERVER_AUTH,
            },
            payload,
        });

        const expected = {
            id: 70,
            title: expect.any(String),
            content: expect.any(String),
        };

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(expected);

        return Promise.resolve();
    });

    it("GET Should Fail Authentication", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/verses",
        });

        expect(res.statusCode).toEqual(401);
        return Promise.resolve();
    });

    it("GET Iterate over /verses/:id", async () => {
        const expected = expect.objectContaining({
            id: expect.any(Number),
            content: expect.any(String),
            title: expect.any(String),
        });

        for (let i = 0; i < 10; i++) {
            const res = await app.inject({
                method: "GET",
                url: `/verses/${i}`,
                headers: {
                    authorization: process.env.SERVER_AUTH,
                },
            });

            expect(res.statusCode).toEqual(200);
            expect(JSON.parse(res.payload)).expectedOrNull(expected);
        }

        return Promise.resolve();
    });
});
