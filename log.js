/**
 * A simple logging module, for consistency and code reusing
 * @author: Davidson Souza
 * @date: December, 2020
 */
/**@todo log is an utility */
const logConf = require("./config.json").logging || false;
const fs = require("fs")
var file;

if(logConf && logConf.logToFile)
    file = fs.createWriteStream(logConf.logToFile, {flags:'a'});

function createLog(data, critical = false)
{
    var d = new Date();
    let log = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}T${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}: ${critical?" Error:":" Info:"} ${data}`;
    
    if(logConf && logConf.logToFile)
        file.write(`${log}\n`, (e) =>{
            if (e) console.error(e);
        });
    if(logConf && logConf.logToStdout)
        console.log(log);
}

module.exports = createLog