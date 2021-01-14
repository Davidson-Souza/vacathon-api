const log       = require("../log")
const leveldown = require("leveldown");
const sha256d   = require("../utilities").default.sha256d;
const db        = leveldown("../tmp/");
let isWorking = false;

db.open("../tmp/session", (err) =>
{
    if(err)
    {
        log(err);
        isWorking = false;
    }
    else
    {
        log("Session db is working!");
        isWorking = true;
    }
});

exports.db = 
{
    createCookie:async (uid, type=0) =>
    {
        if (!isWorking)
        {
            log("Sqlite isn't working", false)

            return -1;
        }
        /** @todo that is clearly a bad method */
        const cookie = type + await sha256d(`cookie${Math.floor(Math.random() * 123123123123123123123)}`);
        db.put(cookie, uid, function (err)
        {
            if(err)
            {
                log(err);
                isWorking = false;
            }
        });
        return cookie;
    },
    deleteCookie: (c) =>
    {
        db.del(c, err =>
        {
            if(err) log(err);
        })
        return true;
    },

    lookUpCookie:(c, next) =>
    {
        db.get(c, (e, v) =>
        {
            if(e != null)
            {
                next(false); 
            }
            else next(v.toString())
        });
    },
};