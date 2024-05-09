
import invariant from "tiny-invariant";
import prisma from "../db.server";
import { connect } from "http2";
import { CustomPlaceholder, Settings } from "@prisma/client";


export async function getSettings(id: string) {
    return await prisma.settings.findFirstOrThrow({
        where: { id: id },
        include: {
            customPlaceholder: true,
            defaultCaption: true
        }
    });
}


export namespace shopSettingsService {

    /**
     * Retrieves the shop settings associated with a given session ID.
     * @param {string} sessionId - The ID of the session for which to retrieve settings.
     * @returns {Promise<SessionSettings | null>} A promise that resolves to the shop settings object or null if not found.
     */
    export async function getShopSettings(sessionId: string) {
        const sessionSettings = await prisma.session.findUnique({
            where: { id: sessionId },
            select: {
                settings: {
                    include: {
                        customPlaceholder: true,
                        defaultCaption: true
                    }
                }
            }
        });

        return sessionSettings
    }
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
                // connectOrCreate: {

                connectOrCreate: {
                    create: {
                        id: shop,
                        session: {
                            connect: {
                                id: shop // Assumes `sessionId` is passed to this function
                            }
                        }
                    },
                    where: {
                        id: shop
                    }
                }


                // create: {
                //     id: shop
                // },
                // where: {
                //     id: shop
                // }
            }
        }
    },
    );
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