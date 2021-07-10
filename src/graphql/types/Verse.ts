import { intArg, list, objectType, queryField } from "nexus";

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
    args: {
        id: intArg(),
    },
    async resolve(source, args, ctx) {
        if (args.id) {
            const data = await ctx.db.verse.findFirst({
                where: {
                    id: args.id,
                },
            });

            return [data];
        }

        return [
            {
                content: "f",
                title: "2",
                id: 2,
            },
        ];
    },
});
