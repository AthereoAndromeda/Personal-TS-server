"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const graphql_1 = __importDefault(require("./graphql"));
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const mercurius_1 = __importDefault(require("mercurius"));
const utils_1 = require("./utils");
const fastify_graceful_shutdown_1 = __importDefault(require("fastify-graceful-shutdown"));
const middie_1 = __importDefault(require("middie"));
const fastify_blipp_1 = __importDefault(require("fastify-blipp"));
async function registerPlugins(app) {
    const ctx = {
        db: app.db,
    };
    app.register(fastify_blipp_1.default);
    await app.register(middie_1.default);
    await app.register(mercurius_1.default, {
        schema: graphql_1.default,
        graphiql: "playground",
        context: () => ctx,
    });
    app.register(fastify_graceful_shutdown_1.default);
    await app.register(fastify_cors_1.default, {
        origin: "*",
    });
    if (utils_1.checkNodeEnv("development")) {
        const Altair = (await Promise.resolve().then(() => __importStar(require("altair-fastify-plugin")))).default;
        app.register(Altair, {
            path: "/altair",
        });
    }
}
async function registerRoutes(app) {
    // Checks for file that ends in `.ts` or `.js`
    const validFileRegex = /\.js$|\.ts$/;
    const FilesInRoutes = await promises_1.default.readdir(path_1.default.resolve(__dirname, "./routes/"));
    const routeFiles = FilesInRoutes.filter(file => validFileRegex.test(file));
    for (const routeFile of routeFiles) {
        const routeImport = await Promise.resolve().then(() => __importStar(require(`./routes/${routeFile}`)));
        const { path, route } = routeImport.default;
        app.register(route, { prefix: path });
        app.log.info(`[${routeFile}]: ${path}`);
    }
}
/**
 * Build the Fastify Server
 * @param app Fastify app
 * @param opts Server Options
 * @returns Built Fastify App or Server
 */
async function buildServer(app, opts) {
    try {
        app.decorate("db", opts.prisma); // 3
        await registerPlugins(app); // 1
        await registerRoutes(app); // 2
        return app;
    }
    catch (err) {
        app.log.error(err);
        throw new Error(err);
    }
}
exports.default = buildServer;
