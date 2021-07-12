import buildServer from "../src/server";
import fastify, { FastifyInstance } from "fastify";
import prisma from "../src/schema/PrismaClient";

let app: FastifyInstance;

describe("Test /verse", () => {
    beforeAll(async () => {
        app = await buildServer(fastify(), { prisma });
        await app.listen(8069, "0.0.0.0");
        return Promise.resolve();
    });

    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();

        return Promise.resolve();
    });

    it("Get all Verses", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/verse",
            headers: {
                Authorization: process.env.SERVER_AUTHKEY,
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
                    Authorization: process.env.SERVER_AUTHKEY,
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
