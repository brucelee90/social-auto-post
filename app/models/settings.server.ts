
import invariant from "tiny-invariant";
import prisma from "../db.server";

export async function getSettings(id: string) {
    return await prisma.settings.findFirst({ where: { id } });
}

export async function postSettings(id: string, useCustomDescription : boolean) {

    await prisma.settings.upsert({
        where: {
          id: id,
        },
        update: {
            isCustomDescription: useCustomDescription,
        },
        create: {
            id: id,
            isCustomDescription: useCustomDescription
        },
      })
      
    
}