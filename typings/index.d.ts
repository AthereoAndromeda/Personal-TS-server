import { FastifyPluginCallback } from "fastify";

export interface Route {
	path: string;
	route: FastifyPluginCallback;
}
