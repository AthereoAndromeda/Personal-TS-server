import { PrismaClient } from "@prisma/client";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { mock, mockClear, stub } from "jest-mock-extended";
import { PrismaPluginOptions } from "../src/plugins/prisma";

describe("Test Plugins", () => {
    const mockServer = mock<FastifyInstance>();
    const mockDB = stub<PrismaClient>();

    afterEach(() => {
        mockClear(mockServer);
        mockClear(mockDB);
    });

    describe("Test Prisma Plugin", () => {
        let plugin: FastifyPluginAsync<PrismaPluginOptions>;
        beforeAll(async () => {
            plugin = (await import("../src/plugins/prisma")).default;
        });

        it("Pass DB to options", () => {
            plugin(mockServer, {
                db: mockDB,
            });

            expect(mockServer.decorate).toBeCalledWith("db", {
                getter: expect.any(Function),
            });
        });
    });
});
