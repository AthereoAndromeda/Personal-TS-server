import buildServer from "../src/server";
import fastify, { FastifyInstance } from "fastify";
import prisma from "../src/schema/PrismaClient";

describe("Test /verse Endpoint", () => {
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
        await prisma.$disconnect();

        return Promise.resolve();
    }, 300000);

    it("GET /verse", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/verse",
            headers: {
                authorization: process.env.SERVER_AUTHKEY,
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

    it("POST /verse", async () => {
        const payload = {
            id: 69,
            title: "nice",
            content: "i know very mature",
        };
        const res = await app.inject({
            method: "POST",
            url: "/verse",
            headers: {
                authorization: process.env.SERVER_AUTHKEY,
            },
            payload,
        });

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(payload);

        return Promise.resolve();
    });

    it("PUT /verse", async () => {
        const payload = {
            id: 2,
            title: "PUT Test",
            content: "Content",
        };

        const res = await app.inject({
            method: "PUT",
            url: "/verse",
            headers: {
                authorization: process.env.SERVER_AUTHKEY,
            },
            payload,
        });

        expect(res.statusCode).toEqual(200);
        expect(JSON.parse(res.payload)).toEqual(payload);

        return Promise.resolve();
    });

    it.todo("PATCH /verse");

    it("DELETE /verse", async () => {
        const payload = {
            id: 70,
        };

        const res = await app.inject({
            method: "DELETE",
            url: "/verse",
            headers: {
                authorization: process.env.SERVER_AUTHKEY,
            },
            payload,
        });

        console.log(res.payload);

        expect(res.statusCode).toEqual(200);
        // expect(JSON.parse(res.payload)).toEqual(payload);

        return Promise.resolve();
    });

    it("GET Should Fail Authentication", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/verse",
        });

        expect(res.statusCode).toEqual(401);
        return Promise.resolve();
    });

    it("GET Iterate over /verses/:id", async () => {
        for (let i = 0; i < 10; i++) {
            const res = await app.inject({
                method: "GET",
                url: `/verse/${1}`,
                headers: {
                    authorization: process.env.SERVER_AUTHKEY,
                },
            });

            const expected = expect.objectContaining({
                id: expect.any(Number),
                content: expect.any(String),
                title: expect.any(String),
            });

            expect(res.statusCode).toEqual(200);
            expect(JSON.parse(res.payload)).toEqual(expected || null);
        }

        return Promise.resolve();
    });
});
