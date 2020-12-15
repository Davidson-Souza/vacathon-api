/**
 * @about: Implements the sqlite functions. To understand why SQLite is here, see docs/storage
 * @author: Davidson Souza
 * @date: December, 2020
 */

const sqlite3 = require("sqlite3")
const sqliteconf = require("../config.json").sqlite
const crypto = require("crypto")

/** Some queries to help */
const insetQuery = `INSERT INTO cookies(uid, cookie) VALUES(?, ?)`;
const selectQuery = "SELECT uid, cookie FROM cookies WHERE cookie=?"
/** An instance of the SQLite module */
var db, isWorking = false;
function createDb()
{
    db = new sqlite3.Database(sqliteconf.dbFile);

    /** Try to create a new table. If it exists, just skip */
    db.run('CREATE TABLE cookies(uid, cookie)', (e) =>
    {
        if (e && e.errno == 1) console.log("SQLite3 table already there");
        else
        {
            console.log("StatusDB is working")
            isWorking = true;
        }
    });
}
createDb();
async function sha256(chunk)
{
    const hash = crypto.createHash('sha256');
    hash.write(chunk);
    await hash.end();
    return hash.read().toString("hex");
}
async function sha256d(chunk)
{
    return sha256(await sha256(chunk));
}

/** The actual module */
exports.db = 
{
    createCookie:async (uid) =>
    {
        if (isWorking)
        {
            return -1;
        }
        const cookie = sha256d(`cookie${Math.floor(Math.random() * 123123123123123123123)}`);
        // insert one row into the langs table
        db.run(insetQuery, [uid, cookie], function(err) {
        if (err) {
            return err;
        }
    });
        return cookie;
    },
    deleteCookie: (c) =>
    {
        db.run(`DELETE FROM cookies WHERE cookie=${c}`, (e, r) =>
        {
            if(e) return e;
        })
        return true;
    },

    lookUpCookie:(c) =>
    {
        db.run(selectQuery,[c], (e, d) =>
        {
           /** @todo: Implement callback */
        });
    },
    validateCookie:(c, next) =>
    {
        db.all(`SELECT cookie, uid FROM cookies WHERE cookie=${c}`, (e, d) =>
        {
            if (e)
                next(e)
            next(false, d);
        })
    }
};