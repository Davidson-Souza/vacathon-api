/**
 * @brief: Implements the IFSuldesteMG's project for the Ideas For Milk 2020, more at README.MD(soon)
 * @author: Davidson Souza
 * @data: December, 2020
 * @license: MIT
 */

const app = require("./app")
const config = require("./config.json");
const port = config.port || 8080;
const host = config.host || "localhost"

app.listen(port, host, () =>
{
  console.log(`Listening to ${port} on ${host}`);
});
