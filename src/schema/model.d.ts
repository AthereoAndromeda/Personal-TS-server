// This does not work for Nexus SourceTypes, Nexus won't detect it and won't appear in nexus-typgen
// export { VerseType as Verse } from "./Verse";

// This method does work though
import type { VerseType } from "./Verse";
export type Verse = VerseType;
