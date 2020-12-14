const sqlite3 = require("sqlite3")

let db = new sqlite3.Database(':memory:');
db.run('CREATE TABLE cookies(uid, cookie)');

exports.db = 
{
    createCookie:async (uid) =>
    {
        cookie = "123"
        // insert one row into the langs table
        db.run(`INSERT INTO cookies(uid, cookie) VALUES(?, ?)`, [uid, cookie], function(err) {
        if (err) {
            return console.log(err.message);
        }
    // get the last insert id
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  });

        return cookie;
    },
    lookUpCookie:(c) =>
    {
        db.run("SELECT * FROM cookies WHERE cookie=?",[c], (e, d) =>
        {
            if (e)
                console.log(e)
            console.log(d);
        });
    },
    validateCookie:(c, next) =>
    {
        db.all("SELECT uid, cookie FROM cookies WHERE cookie=?",[c], (e, d) =>
        {
            if (e)
               next(e)
            next(false, d);
        })
    }
};
