import { list, objectType, queryField } from "nexus";

export const VerseObject = objectType({
	name: "Verse",
	description: "A verse object",
	definition(t) {
		t.int("id");
		t.string("title");
		t.string("content");
	},
});

export const VerseQuery = queryField("verse", {
	type: list("Verse"),
	resolve(source, args, ctx) {
		// TODO link to db
		return [
			{
				content: "f",
				title: "2",
				id: 2,
			},
		];
	},
});
