import { SMTPServer } from "@smtp/server";
// import { APIServer } from "./api/mod.ts";
// import { DatabaseType, MessagesDatabase } from "./database/mod.ts";
import { Configuration } from "@configuration/config";
// import { ClientServer } from "./client/mod.ts";

// TODO (William): Use environment vars first and then config file
// Configuration.setupWithEnv();
Configuration.setConfigWithPath("./posture.json");

// const db = new MessagesDatabase({
//   type: DatabaseType.MongoDB,
//   connectionOptions: {
//     uri: "mongodb://127.0.0.1:27017",
//     database: "posture-smtp",
//   },
// });

// await db.setupDatabase();

new SMTPServer({});

// new APIServer({ db });

// new ClientServer({ baseEndpoint: "http://0.0.0.0:3000", isProduction: false });
