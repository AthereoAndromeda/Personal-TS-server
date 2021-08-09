import { GraphQLPositiveInt } from "graphql-scalars";
import { asNexusMethod } from "nexus";

export const GQLPositiveInt = asNexusMethod(GraphQLPositiveInt, "positiveInt");
