import fastify, { FastifyInstance } from "fastify";
import fs from "fs";
import path from "path";
import { Route } from "typings";

const app = fastify({
	logger: {
		prettyPrint: true,
	},
});

/**
 * Start the Server
 * @param app
 */
async function start(app: FastifyInstance) {
	try {
		const { PORT } = process.env;
		if (!PORT) throw "Port Not Found";

		const routeFiles = (
			await fs.promises.readdir(path.resolve(__dirname, "./routes/"))
		).filter(file => /\.js$|\.ts$/.test(file));

		for (const routeFile of routeFiles) {
			const { path, route }: Route = (
				await import(`./routes/${routeFile}`)
			).default;

			app.register(route, { prefix: path });
		}

		await app.listen(PORT);
		console.log(`Listening to port ${PORT}`);
	} catch (err) {
		app.log.error(err);
		// console.error(err);
	}
}

start(app);
