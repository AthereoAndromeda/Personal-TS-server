"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerseMutation = exports.VerseQuery = exports.VerseObject = void 0;
const nexus_1 = require("nexus");
exports.VerseObject = nexus_1.objectType({
    name: "Verse",
    description: "A verse object",
    definition(t) {
        t.int("id");
        t.string("title");
        t.string("content");
    },
});
exports.VerseQuery = nexus_1.queryField("verse", {
    type: nexus_1.list("Verse"),
    args: {
        id: nexus_1.intArg(),
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
exports.VerseMutation = nexus_1.mutationField("verse", {
    type: "Verse",
    args: {
        id: nexus_1.nonNull(nexus_1.intArg()),
        title: nexus_1.nonNull(nexus_1.stringArg()),
        content: nexus_1.nonNull(nexus_1.stringArg()),
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
