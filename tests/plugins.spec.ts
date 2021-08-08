import { PrismaClient } from "@prisma/client";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { mock, mockClear } from "jest-mock-extended";

describe("Test Prisma Plugin", () => {
    let plugin: FastifyPluginAsync;
    const mockServer = mock<FastifyInstance>();
    const mockDB = mock<PrismaClient>();

    beforeAll(async () => {
        plugin = (await import("../src/plugins/prisma")).default;
    });

    afterEach(() => {
        mockClear(mockServer);
        mockClear(mockDB);
    });

    it("Pass DB to options", () => {
        plugin(mockServer, {
            db: mockDB,
        });

        expect(mockServer.decorate).toBeCalledWith("db", mockDB);
    });

    it("Use defaults", () => {
        plugin(mockServer, {});

        expect(mockServer.decorate).toBeCalledWith(
            "db",
            expect.any(PrismaClient)
        );
    });
});
