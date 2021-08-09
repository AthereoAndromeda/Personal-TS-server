/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { stub } from "jest-mock-extended";
import buildServer from "../src/server";
import "./helper";

describe("Test Server", () => {
    describe("Build Server", () => {
        it("Return Success", async () => {
            const srv = buildServer(fastify(), {
                db: stub<PrismaClient>(),
            });

            expect(srv).toResolve();
            (await srv).close();
        });

        it("Return Success in dev env", async () => {
            const srv = buildServer(fastify(), {
                db: stub<PrismaClient>(),
            });

            expect(srv).toResolve();
            (await srv).close();
        });

        it("Throw Error", () => {
            process.env.__THROW__ = "true";

            const srv = buildServer(fastify(), {
                db: stub<PrismaClient>(),
            });

            expect(srv).rejects.toThrowError("For Testing purposes");
            process.env.__THROW__ = undefined;
        });
    });
});
