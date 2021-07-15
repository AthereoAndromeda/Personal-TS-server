import { Type, Static } from "@sinclair/typebox";

export const Verse = Type.Object({
    id: Type.Number(),
    title: Type.String(),
    content: Type.String(),
});

export type VerseType = Static<typeof Verse>;
