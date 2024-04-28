
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

    const existingPlaceholder = await prisma.customPlaceholder.findUnique({
        where: {
            customPlaceholderId: name,
        }
    });

    if (existingPlaceholder) {
        return await prisma.customPlaceholder.update({
            where: {
                customPlaceholderId: name,
            },
            data: {
                customPlaceholderContent: value,
            }
        });
    } else {
        return await prisma.settings.update({
            where: {
                id: shop,
            },
            data: {
                customPlaceholder: {
                    create: {
                        customPlaceholderId: name,
                        customPlaceholderContent: value
                    },
                },
            },
        });
    }
}

export default settingsService;