import { FastifyPluginCallback } from "fastify";
import prisma from "../schema/PrismaClient";
import { Route } from "typings";

interface Query {
    id?: string;
    title?: string;
    content?: string;
}

interface Params {
    id?: string;
}

const route: FastifyPluginCallback = (app, opts, next) => {
    // Returns all verses
    app.get("/", async (req, res) => {
        try {
            const data = await prisma.verse.findMany();

            res.status(200).send(data);
        } catch (error) {
            app.log.error(error);
            res.status(500).send("500 Internal Server Error");
        }
    });

    // Returns verse with matching id
    app.get("/:id", async (req, res) => {
        try {
            const params = req.params as Params;
            const parsedParam = parseInt(params.id as string);

            if (isNaN(parsedParam)) {
                res.status(400).send(
                    "400 Bad Request: Parameter must be a Number!"
                );
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
