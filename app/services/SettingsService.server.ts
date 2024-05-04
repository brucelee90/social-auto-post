
import invariant from "tiny-invariant";
import prisma from "../db.server";
import { CustomPlaceholder, DefaultCaption, Settings } from '@prisma/client';
import { connect } from "http2";


export async function getSettings(id: string) {
    return await prisma.settings.findFirstOrThrow({
        where: { id: id },
        include: {
            customPlaceholder: true,
            defaultCaption: true
        }
    });
}

interface SettingsService {
    getSettings: (id: string) => Promise<Settings>,
    getCustomPlaceholder: (shop: string) => Promise<{ customPlaceholder: CustomPlaceholder[] }>,
    upsertCustomPlaceholder: (shop: string, customPlaceholderName: string, customPlaceholderContent: string) => Promise<Settings | CustomPlaceholder>
    removeCustomPlaceholder: (shop: string, customPlaceholderName: string) => Promise<void>
    saveDefaultCaption: (shop: string, defaultCaption: string) => Promise<void>
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
        where: {
            customPlaceholderName_settingsId: {
                customPlaceholderName: name,
                settingsId: shop
            }
        },
        update: { customPlaceholderContent: value },
        create: {
            customPlaceholderName: name,
            customPlaceholderContent: value,
            Settings: {
                connectOrCreate: {
                    create: {
                        id: shop
                    },
                    where: {
                        id: shop
                    }
                }
            }
        },
    });
}

settingsService.removeCustomPlaceholder = async (shop: string, name: string) => {
    await prisma.customPlaceholder.deleteMany({
        where: {
            customPlaceholderName: name,
            settingsId: shop,
        },
    });
}

settingsService.saveDefaultCaption = async (shop: string, defaultCaption: string) => {
    await prisma.defaultCaption.upsert({
        where: {
            defaultCaptionName_settingsId: {
                defaultCaptionName: "all",
                settingsId: shop
            }
        },
        update: { defaultCaptionContent: defaultCaption },
        create: {
            defaultCaptionName: "all",
            defaultCaptionContent: defaultCaption,
            Settings: {
                connectOrCreate: {
                    create: {
                        id: shop
                    },
                    where: {
                        id: shop
                    }
                }
            }
        },


    })
}

export default settingsService;