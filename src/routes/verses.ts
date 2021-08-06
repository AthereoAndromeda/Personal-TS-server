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

const route: FastifyPluginCallback = (app, opts, next) => {
    app.addHook("preValidation", (req, res, done) => {
        if (req.headers.authorization !== process.env.SERVER_AUTH) {
            res.status(401).send("401 Unauthorized: Provide API Key");
            done();
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
                    500: Type.String(),
                },
            },
        },
        async (req, res) => {
            try {
                const data = await app.db.verse.findMany();

                res.status(200).send(data);
            } catch (error) {
                app.log.error(error);
                res.status(500).send("500 Internal Server Error");
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
                    500: Type.String(),
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
                res.status(500).send("500 Internal Server Error");
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
                res.status(500).send(error);
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
                res.status(500).send(error);
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
                res.status(500).send(error);
            }
        }
    );

    next();
};

export default {
    path: "/verses",
    route,
} as Route;
