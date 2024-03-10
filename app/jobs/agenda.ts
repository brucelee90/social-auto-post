import { Agenda } from "@hokify/agenda";

const mongoConnectionString = 'mongodb+srv://l4webdsgn:4fIIZs5ldzOblFD3@social-auto-post.ecwtgph.mongodb.net//agenda';

const agenda = new Agenda({ db: { address: mongoConnectionString } });

// Or override the default collection name:
// const agenda = new Agenda({db: {address: mongoConnectionString, collection: 'jobCollectionName'}});

// or pass additional connection options:
// const agenda = new Agenda({db: {address: mongoConnectionString, collection: 'jobCollectionName', options: {ssl: true}}});

// or pass in an existing mongodb-native MongoClient instance
// const agenda = new Agenda({mongo: myMongoClient});

agenda.define('delete old users', async job => {
    // await User.remove({ lastLogIn: { $lt: twoDaysAgo } });
    console.log("DELETE ALL USERS THAT ARE OLDER THAN 73 YEARS");

});

(async function () {
    // IIFE to give access to async/await
    await agenda.start();

    await agenda.every('3 minutes', 'delete old users');

    // Alternatively, you could also do:
    await agenda.every('*/3 * * * *', 'delete old users');
})();
