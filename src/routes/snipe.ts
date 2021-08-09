import { Type } from "@sinclair/typebox";
import { FastifyPluginCallback } from "fastify";
import { SnipeSchema } from "../schema/Snipes";
import { Route } from "typings";

const error500Schema = Type.Object({
    statusCode: Type.Number(),
    message: Type.String(),
    error: Type.String(),
});

const route: FastifyPluginCallback = async (app, opts, done) => {
    app.get(
        "/",
        {
            schema: {
                response: {
                    200: SnipeSchema,
                    500: error500Schema,
                },
            },
        },
        async (req, res) => {
            try {
                const data = await app.db.snipes.findFirst();
                res.status(200).send(data);
            } catch (error) {
                res.internalServerError(error);
            }
        }
    );

    done();
};

export default {
    path: "/snipes",
    route,
} as Route;
