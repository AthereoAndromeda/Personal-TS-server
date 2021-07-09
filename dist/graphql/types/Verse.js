"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerseQuery = exports.VerseObject = void 0;
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
