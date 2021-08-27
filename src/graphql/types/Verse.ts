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
            try {
                const data = await ctx.db.verse.findUnique({
                    where: {
                        id: args.id,
                    },
                });
                return [data];
            } catch (error) {
                ctx.req.server.log.error(error);
                throw new Error(error as string);
            }
        }

        try {
            return await ctx.db.verse.findMany();
        } catch (error) {
            ctx.req.server.log.error(error);
            throw new Error(error as string);
        }
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
        try {
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
        } catch (error) {
            ctx.req.server.log.error(error);
            throw new Error(error as string);
        }
    },
});
