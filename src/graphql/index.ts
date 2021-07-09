import { makeSchema } from "nexus";
import path from "path";
import * as types from "./types";

export default makeSchema({
	types,
	outputs: {
		schema: path.resolve(__dirname, "./schema.graphql"),
		typegen: path.resolve(__dirname, "./nexus-typegen.ts"),
	},
	sourceTypes: {
		modules: [
			{
				module: path.resolve(__dirname, "../schema/model.d.ts"),
				alias: "model",
			},
		],
	},
	contextType: {
		module: path.resolve(__dirname, "../schema/context.d.ts"),
		export: "Context",
	},
});
