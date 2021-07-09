import { FastifyPluginCallback } from "fastify";

const route: FastifyPluginCallback = (app, opts, done) => {
    app.get("/", (req, res) => {
        res.status(200).send("test");
    });

    done();
};

export default {
    path: "/",
    route,
};
