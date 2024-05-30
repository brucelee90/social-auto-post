import { DefaultDeserializer } from "v8";
import prisma from "../db.server";
import { CustomPlaceholder, DefaultCaption, Settings } from "@prisma/client";


export namespace shopSettingsService {

    /**
     * Retrieves the shop settings associated with a given session ID.
     * @param {string} sessionId - The ID of the session for which to retrieve settings.
     * @returns {Promise<SessionSettings | null>} A promise that resolves to the shop settings object or null if not found.
     */
    export async function getShopSettings(sessionId: string) {
        return await prisma.session.findUnique({
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
    }

    /**
     * Upserts the default caption for a given shop.
     * @param {string} sessionId - The ID of the shop for which the default caption is being upserted.
     * @param {string} defaultCaption - The new content of the default caption.
     */
    export async function upsertDefaultCaption(sessionId: string, defaultCaption: string): Promise<void> {
        await prisma.defaultCaption.upsert({
            where: {
                defaultCaptionName_settingsId: {
                    defaultCaptionName: "all",
                    settingsId: sessionId
                }
            },
            update: { defaultCaptionContent: defaultCaption },
            create: {
                defaultCaptionName: "all",
                defaultCaptionContent: defaultCaption,
                Settings: {
                    connectOrCreate: {
                        create: {
                            id: sessionId,
                            session: {
                                connect: {
                                    id: sessionId
                                }
                            }
                        },
                        where: {
                            id: sessionId
                        }
                    }
                }
            }
        })
    }


    /**
     * Upserts a custom placeholder value for a given shop.
     * @param {string} shop - The ID of the shop for which the custom placeholder is being upserted.
     * @param {string} name - The name of the custom placeholder.
     * @param {string} value - The new content of the custom placeholder.
     */
    export async function upsertCustomPlaceholder(shop: string, name: string, value: string) {

        console.log("shop", shop);

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
                            id: shop,
                            session: {
                                connect: {
                                    id: shop
                                }
                            }
                        },
                        where: {
                            id: shop,
                        }
                    }
                }
            }
        },);
    }

    export async function removeCustomPlaceholder(shop: string, name: string) {
        await prisma.customPlaceholder.deleteMany({
            where: {
                customPlaceholderName: name,
                settingsId: shop,
            },
        });
    }

    export async function upsertFacebookAccessToken(shop: string, fbAccessToken: string, fbPageId: string) {

        try {
            await prisma.settings.upsert({
                where: { id: shop },
                update: { facebookAccessToken: fbAccessToken, facebookPageId: fbPageId },
                create: {
                    id: shop,
                    facebookAccessToken: fbAccessToken,
                    facebookPageId: fbPageId,
                    session: {
                        connect: {
                            id: shop
                        }
                    }
                },
            });
        } catch (error) {
            console.log(error);
            throw new Error("Could not create facebook Access Token")
        }


    }

}