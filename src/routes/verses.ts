import { Type } from "@sinclair/typebox";
import { FastifyPluginCallback } from "fastify";
import { Route } from "typings";
import { VerseSchema, VerseType } from "../schema/Verse";

interface ReqInterface {
    Querystring: {
        id?: string;
        title?: string;
        content?: string;
    };

    // Headers: {}

    Params: {
        id: number;
    };

    Body: VerseType;
}

const error500Schema = Type.Object({
    statusCode: Type.Number(),
    message: Type.String(),
    error: Type.String(),
});

const route: FastifyPluginCallback = (app, opts, done) => {
    // Check for API key
    app.addHook("onRequest", (req, res, done) => {
        if (req.headers.authorization !== process.env.SERVER_AUTH) {
            res.unauthorized("API Key Required");
        }

        done();
    });

    // Returns all verses
    app.get<ReqInterface>(
        "/",
        {
            schema: {
                response: {
                    200: Type.Array(VerseSchema),
                    500: error500Schema,
                },
            },
        },
        async (req, res) => {
            try {
                const data = await app.db.verse.findMany();
                res.status(200).send(data);
            } catch (error) {
                app.log.error(error);
                res.internalServerError(error);
            }
        }
    );

    // Returns verse with matching id
    app.get<ReqInterface>(
        "/:id",
        {
            schema: {
                params: Type.Object({ id: Type.Number() }),
                response: {
                    200: Type.Union([VerseSchema, Type.Null()]),
                    500: error500Schema,
                },
            },
        },
        async (req, res) => {
            try {
                const data = await app.db.verse.findUnique({
                    where: {
                        id: req.params.id,
                    },
                });

                res.status(200).send(data);
            } catch (error) {
                app.log.error(error);
                res.internalServerError(error);
            }
        }
    );

    app.post<ReqInterface>(
        "/",
        {
            schema: {
                body: VerseSchema,
                response: {
                    200: VerseSchema,
                    500: error500Schema,
                },
            },
        },
        async (req, res) => {
            try {
                const { id, title, content } = req.body;

                const data = await app.db.verse.create({
                    data: {
                        id,
                        title,
                        content,
                    },
                });

                res.status(200).send(data);
            } catch (error) {
                app.log.error(error);
                res.internalServerError(error);
            }
        }
    );

    app.put<ReqInterface>(
        "/",
        {
            schema: {
                body: VerseSchema,
                response: {
                    200: VerseSchema,
                    500: error500Schema,
                },
            },
        },
        async (req, res) => {
            try {
                const { id, title, content } = req.body;

                const data = await app.db.verse.update({
                    where: {
                        id,
                    },
                    data: {
                        id,
                        title,
                        content,
                    },
                });

                res.status(200).send(data);
            } catch (error) {
                app.log.error(error);
                res.internalServerError(error);
            }
        }
    );

    app.delete<ReqInterface>(
        "/",
        {
            schema: {
                body: Type.Object({ id: Type.Number() }),
                response: {
                    200: VerseSchema,
                    500: error500Schema,
                },
            },
        },
        async (req, res) => {
            try {
                const { id } = req.body;

                const data = await app.db.verse.delete({
                    where: {
                        id,
                    },
                });

                res.status(200).send(data);
            } catch (error) {
                app.log.error(error);
                res.internalServerError(error);
            }
        }
    );

    done();
};

export default {
    path: "/verses",
    route,
} as Route;
