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
app.listen(port, host, () =>
{
  log(`Listening to ${port} on ${host}`);
});

/**PATCH submeter leitura
 * get getDadosLeitura
 * get getLeitura
 * head getHeaderLeitura
 * put createrealationship
 * delete delete relationship
 * get logiscaLaticinios
 */