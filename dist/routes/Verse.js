"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typebox_1 = require("@sinclair/typebox");
const Verse = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    title: typebox_1.Type.String(),
    content: typebox_1.Type.String(),
});
function parseIdParam(req, res, done) {
    const parsedParam = parseInt(req.params.id);
    if (isNaN(parsedParam)) {
        const errMsg = "400 Bad Request: Parameter must be a Number!";
        res.status(400).header("content-type", "text/plain").send(errMsg);
        done();
    }
    done();
}
const route = (app, opts, next) => {
    app.addHook("preValidation", (req, res, done) => {
        if (req.headers.authorization !== process.env.SERVER_AUTHKEY) {
            res.status(401).send("401 Unauthorized: Provide API Key");
            done();
        }
        done();
    });
    // Returns all verses
    app.get("/", async (req, res) => {
        try {
            const data = await app.db.verse.findMany();
            res.status(200).send(data);
        }
        catch (error) {
            app.log.error(error);
            res.status(500).send("500 Internal Server Error");
        }
    });
    // Returns verse with matching id
    app.get("/:id", { preHandler: parseIdParam }, async (req, res) => {
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
        }
        catch (error) {
            app.log.error(error);
            res.status(500).send("500 Internal Server Error");
        }
    });
    app.post("/", {
        schema: {
            body: Verse,
            response: {
                200: Verse,
            },
        },
    }, async (req, res) => {
        try {
            const data = await app.db.verse.create({
                data: {
                    id: req.body.id,
                    title: req.body.title,
                    content: req.body.content,
                },
            });
            res.status(200).send(data);
        }
        catch (error) {
            res.status(500).send(error);
        }
    });
    next();
};
exports.default = {
    path: "/verse",
    route,
};
