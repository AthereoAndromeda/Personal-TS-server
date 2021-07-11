const buildServer = require("../dist/server.js").default;
const fastify = require("fastify")();
const prisma = require("../dist/schema/PrismaClient").default;
require("dotenv").config();

let app;

describe("Test Authorization", () => {
    // Start Server and connect to DB
    beforeAll(async () => {
        app = await buildServer(fastify, { prisma });
        await app.listen(8081, "0.0.0.0");
        return Promise.resolve();
    });

    // Stop Server and disconnect DB
    afterAll(async () => {
        await app.close();
        await prisma.$disconnect();

        return Promise.resolve();
    });

    it("Should Return 401 Unauthorized: Incorrect Auth Key", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/",
            headers: {
                Authorization: "incorrectAuthorizationKey",
            },
        });

        expect(res.statusCode).toEqual(401);

        return Promise.resolve();
    });

    it("Should Return 401 Unauthorized: No Auth Key", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/",
        });

        expect(res.statusCode).toEqual(401);

        return Promise.resolve();
    });

    it("Should Return 200 Success", async () => {
        const res = await app.inject({
            method: "GET",
            url: "/",
            headers: {
                Authorization: process.env.SERVER_AUTHKEY,
            },
        });

        expect(res.statusCode).toEqual(200);

        return Promise.resolve();
    });
});
