import { PrismaClient } from "@prisma/client";
import { Verse } from "src/schema/model";

const prisma = new PrismaClient();

const verses: Verse[] = [
    {
        id: 1,
        title: "Title 1",
        content: "Some Content",
    },
    {
        id: 2,
        title: "Title 2",
        content: "Content number 2",
    },
    {
        id: 3,
        title: "Green Day",
        content: "Is awesome",
    },
];

async function seed(prisma: PrismaClient) {
    for (const verse of verses) {
        const res = await prisma.verse.upsert({
            where: {
                id: verse.id,
            },
            update: {
                id: verse.id,
                title: verse.title,
                content: verse.content,
            },
            create: {
                id: verse.id,
                title: verse.title,
                content: verse.content,
            },
        });

        console.log(res);
    }
}

(async () => {
    try {
        await prisma.$connect();
        await seed(prisma);
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
})();
