// import moment from "moment";
// import postScheduleQueueService from "~/services/postScheduleQueueService.server";
import { Agenda, Job } from "@hokify/agenda";

// const scheduler = require('node-schedule');
// const env = process.env.NODE_ENV || "development";
// const config = require(__dirname + "/../config/config.js")[env];
// const { allDefinitions } = require("./definitions");

// establised a connection to our mongoDB database.
const agenda = new Agenda({
    db: { address: process.env.MONGO_DB_CONNECTION_URL as string, collection: "agendaJobs" }, processEvery: "1 minute",
    maxConcurrency: 20,
});

// listen for the ready or error event.
agenda
    .on("ready", () => console.log("Agenda started!"))
    .on("error", () => console.log("Agenda connection error!"));

// define all agenda jobs
// allDefinitions(agenda);

// logs all registered jobs 
console.log({ jobs: agenda.definitions });

module.exports = agenda;
