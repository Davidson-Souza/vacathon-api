const utilities = require("../utilities").default
const log = require("../log");
const users = require("./users").default;
const db = require("./mysql").db;
/** Log it! */
log("Starting analyze subsystem", false);

exports.default = 
{
    getUserAnalyzes: async (req, res, next) =>
    {
        if(!(req.cookies && req.cookies.userId))
            return (res.json({ok:false, err:"Must be logged in"}))

        const cookie = req.cookies.userId;
        if((await utilities.sanitize(cookie) < 0))
            res.json({ok:false, err:"Forbidden character"});
        users.isAuthenticated(cookie, (r) => 
        {
            if(!(r && r[0]))
                return res.json({ok:false, err:"You are not logged in"});
            else
            {
                r = r[0]

                db.getUserAnalyze(r.uid, (err, ret) =>
                    {
                        /**@TODO catch errors */
                        if(err) 
                            return res.status(500).json({ok:false, err:"Internal error"});
                        else 
                            return res.json({ok:true, ret});
                    });
            }
        });
    },
    submitAnalyze: async (req, res, next) =>
    {
        if (!req.file) 
            return res.send({ok: false, err:"No file"});
        if(!req.cookies.userId)
            return res.status(400).json({ok:false, err:"Must be logged in"});
        
        const cookie = req.cookies.userId;
        if((await utilities.sanitize(cookie) < 0))
            return res.json({ok:false, err:"Forbidden character"});
        users.isAuthenticated(cookie, (r) => 
        {
            r = r[0]
            if(r == false)
                return res.json({ok:false, err:"You are not logged in"});
            else
            {
                    db.createAnalyze({imgName:req.file.filename, ownerId: r.uid}, (err, ret) =>
                    {
                        /**@TODO catch errors */
                        if(err) 
                            return res.status(500).json({ok:false, err:"Internal error"});
                        else 
                            return res.json({ok:true});
                    });
            }
        });
    },
    getData: async (req, res, next) =>
    {
        /** This request is only possible for logged ones */
        if (!(req.cookies && req.cookies.userId))
            return res.status(403).json({ok:false, err:"Missing cookie"});
        
        const cookie = req.cookies.userId;
    
        /** Check whether there is some kind of sus data, like some sql injection attack */
        if ((await utilities.sanitize(cookie) < 0))
            return res.status(403).json({ok:false, err:"Forbidden character"});
        users.isAuthenticated(cookie, (r) =>
        {
            if(r)
                return res.json({ok:false, err:"You are not logged in"});
        });
    }
};
