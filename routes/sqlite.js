const sqlite3 = require("sqlite3")

let db = new sqlite3.Database(':memory:');
db.run('CREATE TABLE cookies(uid cookie)');

exports.db = 
{
    createCookie:(uid, cookie) =>
    {
        db.run("INSERT INTO cookies(uid cookie) VALUES (? ?)", [uid, cookie])
    },
    validateCookie:(u, c) =>
    {
        db.run("SELECT * FROM cookies WHERE id=?",[u], (e, d) =>
        {
            if (e)
                console.log(e)
            console.log(d);
        })
    }
};
