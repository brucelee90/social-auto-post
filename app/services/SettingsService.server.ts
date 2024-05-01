
import invariant from "tiny-invariant";
import prisma from "../db.server";
import { CustomPlaceholder, Settings } from '@prisma/client';


export async function getSettings(id: string) {
    return await prisma.settings.findFirstOrThrow({
        where: { id: id },
        include: {
            customPlaceholder: true
        }
    });
}

interface SettingsService {
    getSettings: (id: string) => Promise<Settings>,
    getCustomPlaceholder: (shop: string) => Promise<{ customPlaceholder: CustomPlaceholder[] }>,
    upsertCustomPlaceholder: (shop: string, customPlaceholderName: string, customPlaceholderContent: string) => Promise<Settings | CustomPlaceholder>
}

const settingsService = {} as SettingsService

settingsService.getSettings = async (id: string) => {
    return await prisma.settings.findFirstOrThrow({
        where: { id: id },
        include: {
            customPlaceholder: true
        }
    });
}

settingsService.getCustomPlaceholder = async (shop: string) => {
    return await prisma.settings.findFirstOrThrow({
        where: { id: shop },
        include: {
            customPlaceholder: true
        }
    });
}

settingsService.upsertCustomPlaceholder = async (shop: string, name: string, value: string) => {
    return await prisma.customPlaceholder.upsert({
        where: { customPlaceholderId: name },
        update: { customPlaceholderContent: value },
        create: {
            customPlaceholderId: name,
            customPlaceholderContent: value,
            Settings: {
                connectOrCreate: {
                    where: {
                        id: shop,
                    },
                    create: {
                        id: shop,
                    },
                },
            },
        },
    });
}

export default settingsService;