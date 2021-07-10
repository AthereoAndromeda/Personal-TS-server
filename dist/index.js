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
const fastify_1 = __importDefault(require("fastify"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const graphql_1 = __importDefault(require("./graphql"));
const fastify_cors_1 = __importDefault(require("fastify-cors"));
const mercurius_1 = __importDefault(require("mercurius"));
const PrismaClient_1 = __importDefault(require("./schema/PrismaClient"));
const utils_1 = require("./utils");
const app = fastify_1.default({
    logger: {
        prettyPrint: utils_1.checkNodeEnv("development") ? true : false,
    },
});
const ctx = {
    db: PrismaClient_1.default,
};
async function registerPlugins(app) {
    await app.register(mercurius_1.default, {
        schema: graphql_1.default,
        graphiql: "playground",
        context: () => ctx,
    });
    await app.register(fastify_cors_1.default, {
        origin: "*",
    });
    if (utils_1.checkNodeEnv("development")) {
        const Altair = (await Promise.resolve().then(() => __importStar(require("altair-fastify-plugin")))).default;
        await app.register(Altair, {
            path: "/altair",
        });
    }
}
async function registerRoutes(app) {
    // Checks for file that ends in `.ts` or `.js`
    const validFileRegex = /\.js$|\.ts$/;
    const FilesInRoutes = await fs_1.default.promises.readdir(path_1.default.resolve(__dirname, "./routes/"));
    const routeFiles = FilesInRoutes.filter(file => validFileRegex.test(file));
    for (const routeFile of routeFiles) {
        const routeImport = await Promise.resolve().then(() => __importStar(require(`./routes/${routeFile}`)));
        const { path, route } = routeImport.default;
        app.register(route, { prefix: path });
    }
}
/**
 * Start the Server
 * @param app App instance
 */
async function start(app) {
    try {
        const { PORT } = process.env;
        if (!PORT)
            throw "Port Not Found";
        await PrismaClient_1.default.$connect();
        await registerPlugins(app);
        await registerRoutes(app);
        await app.listen(PORT);
        console.log(`Listening to port ${PORT}`);
    }
    catch (err) {
        app.log.error(err);
        // console.error(err);
    }
}
start(app);
