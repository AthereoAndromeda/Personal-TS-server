import { Static, Type } from "@sinclair/typebox";
import {
    DoneFuncWithErrOrRes,
    FastifyPluginCallback,
    FastifyReply,
    FastifyRequest,
} from "fastify";
import { Route } from "typings";

interface ReqInterface {
    Querystring: {
        id?: string;
        title?: string;
        content?: string;
    };

    // Headers: {}

    Params: {
        id: string;
    };

    Body: VerseType;
}

type VerseType = Static<typeof Verse>;

const Verse = Type.Object({
    id: Type.Number(),
    title: Type.String(),
    content: Type.String(),
});

function parseIdParam(
    req: FastifyRequest<ReqInterface>,
    res: FastifyReply,
    done: DoneFuncWithErrOrRes
) {
    const parsedParam = parseInt(req.params.id);

    if (isNaN(parsedParam)) {
        const errMsg = "400 Bad Request: Parameter must be a Number!";
        res.status(400).header("content-type", "text/plain").send(errMsg);
        done();
    }

    done();
}

const route: FastifyPluginCallback = (app, opts, next) => {
    app.addHook("preValidation", (req, res, done) => {
        if (req.headers.authorization !== process.env.SERVER_AUTHKEY) {
            res.status(401).send("401 Unauthorized: Provide API Key");
            done();
        }

        done();
    });

    // Returns all verses
    app.get<ReqInterface>("/", async (req, res) => {
        try {
            const data = await app.db.verse.findMany();

            res.status(200).send(data);
        } catch (error) {
            app.log.error(error);
            res.status(500).send("500 Internal Server Error");
        }
    });

    // Returns verse with matching id
    app.get<ReqInterface>(
        "/:id",
        { preHandler: parseIdParam },
        async (req, res) => {
            try {
                const parsedParam = parseInt(req.params.id);

                if (isNaN(parsedParam)) {
                    const errMsg =
                        "400 Bad Request: Parameter must be a Number!";

                    res.status(400)
                        .header("content-type", "text/plain")
                        .send(errMsg);

                    return;
                }

                const data = await app.db.verse.findFirst({
                    where: {
                        id: parsedParam,
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
                body: Verse,
                response: {
                    200: Verse,
                },
            },
        },
        async (req, res) => {
            try {
                const data = await app.db.verse.create({
                    data: {
                        id: req.body.id,
                        title: req.body.title,
                        content: req.body.content,
                    },
                });

                res.status(200).send(data);
            } catch (error) {
                res.status(500).send(error);
            }
        }
    );

    app.put<ReqInterface>(
        "/",
        {
            schema: {
                body: Verse,
                response: {
                    200: Verse,
                    400: { type: "string" },
                },
            },
        },
        async (req, res) => {
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
        }
    );

    next();
};

export default {
    path: "/verse",
    route,
} as Route;
