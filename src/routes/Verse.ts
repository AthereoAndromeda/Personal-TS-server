import { Static, Type } from "@sinclair/typebox";
import {
    FastifyPluginCallback,
    FastifySchema,
    preHandlerHookHandler,
    RouteShorthandOptions,
} from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import { Route } from "typings";

interface Querystring {
    id?: string;
    title?: string;
    content?: string;
}

interface Params {
    id: string;
}

interface ReqInterface {
    Querystring: Querystring;
    Params: Params;
    Body: VerseType;
    Response: VerseType;
}

const Verse = Type.Object({
    id: Type.Number(),
    title: Type.String(),
    content: Type.String(),
});

type CustomOpts = RouteShorthandOptions<
    Server,
    IncomingMessage,
    ServerResponse,
    ReqInterface,
    unknown,
    FastifySchema
>;

const postOpts: CustomOpts = {
    schema: {
        body: Verse,
        response: {
            200: Verse,
        },
    },
    preHandler: (req, res, done) => {
        const parsedParam = parseInt(req.params.id);

        if (isNaN(parsedParam)) {
            const errMsg = "400 Bad Request: Parameter must be a Number!";
            res.status(400).header("content-type", "text/plain").send(errMsg);
            return;
        }
        done();
    },
};

type VerseType = Static<typeof Verse>;

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
    app.get<ReqInterface>("/:id", async (req, res) => {
        try {
            const parsedParam = parseInt(req.params.id);

            if (isNaN(parsedParam)) {
                const errMsg = "400 Bad Request: Parameter must be a Number!";

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
    });

    app.post<ReqInterface>("/", postOpts, async (req, res) => {
        try {
            const parsedParam = parseInt(req.params.id);

            if (isNaN(parsedParam) || !req.params.id) {
                const errMsg = "400 Bad Request: Parameter must be a Number!";

                res.status(400)
                    .header("content-type", "text/plain")
                    .send(errMsg);

                return;
            }
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
    });

    next();
};

export default {
    path: "/verse",
    route,
} as Route;
