import { Type, Static } from "@sinclair/typebox";

export const SnipeSchema = Type.Object({
    id: Type.Number(),
    author: Type.String(),
    content: Type.String(),
});

export type SnipeType = Static<typeof SnipeSchema>;
