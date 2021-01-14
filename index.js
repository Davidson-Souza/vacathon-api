/**
 * @brief: Implements the IFSuldesteMG's project for the Ideas For Milk 2020, more at README.MD(soon)
 * @author: Davidson Souza
 * @date: December, 2020
 * @license: MIT
 */
const log = require("./log")
const app = require("./app")
const config = require("./config.json");
console.log(process.env)
const port = process.env.PORT;
/** Catch errors, don't break */
process.on("uncaughtException", (e) =>
{
  log(e, true);
});
process.on("unhandledRejection", (e) =>
{
  log(e, true);
});
/**Let's log the time of startup */
log("System startup");
/**Listen to the API port */
app.listen(port, () => console.log("Server is running..."));
