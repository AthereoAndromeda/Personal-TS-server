import {
    intArg,
    list,
    mutationField,
    nonNull,
    objectType,
    queryField,
    stringArg,
} from "nexus";

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
    async resolve(_, args, ctx) {
        if (args.id) {
            const data = await ctx.db.verse.findFirst({
                where: {
                    id: args.id,
                },
            });

            return [data];
        }

        return await ctx.db.verse.findMany();
    },
});

export const VerseMutation = mutationField("verse", {
    type: "Verse",
    args: {
        id: nonNull(intArg()),
        title: nonNull(stringArg()),
        content: nonNull(stringArg()),
    },
    async resolve(_, args, ctx) {
        const res = await ctx.db.verse.upsert({
            where: {
                id: args.id,
            },
            update: {
                id: args.id,
                title: args.title,
                content: args.content,
            },
            create: {
                id: args.id,
                title: args.title,
                content: args.content,
            },
        });

        return res;
    },
});
