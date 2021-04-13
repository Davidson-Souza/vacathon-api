const log       = require("../log")
const leveldown = require("leveldown");
const sha256d   = require("../utilities").default.sha256d;
const db        = leveldown("../tmp/");
let isWorking = false;
var d = new Date();

db.open("tmp/session", (err) =>
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
    /**
     * There are 3 types of cookies: session, password recovery and confirmation
     * @param {an id of the user} uid 
     * @param {the type of the cookie, defined above} type 
     */
    createCookie:async (uid, type=0) =>
    {
        if (!isWorking)
        {
            log("Sqlite isn't working", false)

            return -1;
        }
        /** @todo that is clearly a bad method */
        const cookie = type + await sha256d(`cookie${Math.floor(Math.random() * 123123123123123123123)}`);
        db.put(cookie, `${d.getTime()};${uid}`, function (err)
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
    isExpired:async (c, next) =>
    {
        await db.get(c, (e, v) =>
        {
            if(e!=null)
                return next(-1);
            const parsed = v.toString().split(";");
            if(c.charAt(0) == '0' && Number (parsed[0]) < d.getTime())
                return next(true);
            if(c.charAt(0) == '1' && Number (parsed[0]) < d.getTime())
                return next(true);
            next(false)
        });
    },
    lookUpCookie:(c, next) =>
    {
        db.get(c, (e, v) =>
        {
            if(e != null)
            {
                next(false); 
            }
            else next(v.toString().split(";")[1])
        });
    },
};