import fastify, { FastifyInstance } from "fastify";

const app = fastify({
	logger: {
		prettyPrint: true,
	},
});

async function start(app: FastifyInstance) {
	try {
		const { PORT } = process.env;

		if (!PORT) throw "Port Not Found";

		await app.listen(PORT);
		console.log(`Listening to port ${PORT}`);
	} catch (err) {
		app.log.error(err);
		// console.error(err);
	}
}

start(app);
