// config.ts
export const config = {
    mongoDbConnectionUrl: process.env.MONGO_DB_CONNECTION_URL as string,
    agendaCollection: "agendaJobs"
};