import { FastifyPluginCallback, FastifyRequest } from "fastify";
import prisma from "../schema/PrismaClient";
import { Route } from "typings";

interface Querystring {
    id?: string;
    title?: string;
    content?: string;
}

interface Params {
    id: string;
}

interface ReqInterface extends FastifyRequest {
    Querystring: Querystring;
    Params: Params;
}

const route: FastifyPluginCallback = (app, opts, next) => {
    // Returns all verses
    app.get<ReqInterface>("/", async (req, res) => {
        try {
            const data = await prisma.verse.findMany();

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
                res.status(400).send(errMsg);
                return;
            }

            const data = await prisma.verse.findFirst({
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

    next();
};

export default {
    path: "/verse",
    route,
} as Route;