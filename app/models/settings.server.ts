
import invariant from "tiny-invariant";
import prisma from "../db.server";

export async function getSettings(id: number) {
    return await prisma.settings.findFirst({ where: { id } });
}