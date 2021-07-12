"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cb = (req, res, done) => {
    if (req.headers.authorization !== process.env.SERVER_AUTHKEY) {
        res.status(401).send("401 Unauthorized: Provide API Key");
        done();
    }
    done();
};
const opt = {
    onRequest: cb,
};
const route = (app, opts, next) => {
    // Returns all verses
    app.get("/", opt, async (req, res) => {
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
    app.get("/:id", opt, async (req, res) => {
        try {
            const parsedParam = parseInt(req.params.id);
            if (isNaN(parsedParam)) {
                const errMsg = "400 Bad Request: Parameter must be a Number!";
                res.status(400).send(errMsg);
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
    next();
};
exports.default = {
    path: "/verse",
    route,
};
