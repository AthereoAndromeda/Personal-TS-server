"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PrismaClient_1 = __importDefault(require("../schema/PrismaClient"));
const route = (app, opts, next) => {
    // Returns all verses
    app.get("/", async (req, res) => {
        try {
            const data = await PrismaClient_1.default.verse.findMany();
            res.status(200).send(data);
        }
        catch (error) {
            app.log.error(error);
            res.status(500).send("500 Internal Server Error");
        }
    });
    // Returns verse with matching id
    app.get("/:id", async (req, res) => {
        try {
            const parsedParam = parseInt(req.params.id);
            if (isNaN(parsedParam)) {
                const errMsg = "400 Bad Request: Parameter must be a Number!";
                res.status(400).send(errMsg);
                return;
            }
            const data = await PrismaClient_1.default.verse.findFirst({
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
