import buildServer from "../src/server";
import fastify, { FastifyInstance } from "fastify";
import prisma from "../src/schema/PrismaClient";

describe("Test /verse", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildServer(fastify(), { prisma });
        await app.listen(8069, "0.0.0.0");
        return Promise.resolve();
    }, 300000);

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();

        return Promise.resolve();
    }, 300000);

    it("Get all Verses", async () => {
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

    it("Get specific verses", async () => {
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

    it("Should fail auth", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/verse",
        });

        expect(res.statusCode).toEqual(401);
        return Promise.resolve();
    });

    it.skip("POST verse", async () => {
        const res = await app.inject({
            method: "POST",
            url: "/verse/2",
            headers: {
                authorization: process.env.SERVER_AUTHKEY,
            },
        });

        expect(res.statusCode).toEqual(200);

        return Promise.resolve();
    });
});
