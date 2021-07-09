import fastify, { FastifyInstance } from "fastify";
import fs from "fs";
import mercurius from "mercurius";
import path from "path";
import { Route } from "typings";

const app = fastify({
	logger: {
		prettyPrint: true,
	},
});

async function registerPlugins(app: FastifyInstance) {
	// app.register(mercurius, {
	// 	schema: [],
	// 	graphiql: "/playground",
	// });
}

async function registerRoutes(app: FastifyInstance) {
	// Checks for file that ends in `.ts` or `.js`
	const validFileRegex = /\.js$|\.ts$/;

	const FilesInRoutes = await fs.promises.readdir(
		path.resolve(__dirname, "./routes/")
	);

	const routeFiles = FilesInRoutes.filter(file => validFileRegex.test(file));

	for (const routeFile of routeFiles) {
		const routeImport = await import(`./routes/${routeFile}`);
		const { path, route }: Route = routeImport.default;

		app.register(route, { prefix: path });
	}
}

/**
 * Start the Server
 * @param app
 */
async function start(app: FastifyInstance) {
	try {
		const { PORT } = process.env;
		if (!PORT) throw "Port Not Found";

		await registerPlugins(app);
		await registerRoutes(app);

		await app.listen(PORT);
		console.log(`Listening to port ${PORT}`);
	} catch (err) {
		app.log.error(err);
		// console.error(err);
	}
}

start(app);
