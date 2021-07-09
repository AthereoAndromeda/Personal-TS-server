"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const route = (app, opts, done) => {
    app.get("/", (req, res) => {
        res.status(200).send("test");
    });
    done();
};
exports.default = {
    path: "/",
    route,
};
