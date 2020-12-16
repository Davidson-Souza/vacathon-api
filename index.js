/**
 * @brief: Implements the IFSuldesteMG's project for the Ideas For Milk 2020, more at README.MD(soon)
 * @author: Davidson Souza
 * @date: December, 2020
 * @license: MIT
 */
const log = require("./log")
const app = require("./app")
const config = require("./config.json");
const port = config.port || 8080;
const host = config.host || "localhost"

log("System startup")
app.listen(port, host, () =>
{
  log(`Listening to ${port} on ${host}`);
});
