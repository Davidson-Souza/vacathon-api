const permanentStorage = require("./mysql").db;
const statusDb = require("./sqlite").db;
const log = require("../log");

/** Verify if a passed string is potentially harmful */
function sanitize(str, isEmail = false)
{
    /** Is empty or too big? */
    /**
     * NOTE: 256 is considered to be the greater string allowed in our database, is the double-sha256
     * of the user's password
     */
    if (str == null || str == undefined || str.length>256)
        return -1;
    
    let c = "";
    /** Shouldn't have any non-alphanumeric digit (except emails) */
    for (let i = 0; i<str.length; i++)
    {
        c = str.charAt(i);
        if((c < '0' || c > 'z') && !isEmail)
            return -1;
        else if(((c < '0' || c > 'z') && (c !="." && c !="@")) && isEmail)
            return -1;   
    }
    return 1;
}
/** How a user should looks like */
const baseUser = 
{
    name:0, age:0, password:0, email:0, metaInfo:0
}
exports.default = 
{
    missingParam: async function(req, res, next) 
    {
      return res.status(403).json({ok:false, err:"Missing id param"})
    },
    getUserMetaInfoById: async function(req, res, next) 
    {
        // This probably will never happens, thanks to the fallback above.
        // But... Who knows? It's better just prevent...
        if(!req.params || !req.params.userId)
            return res.status(403).json({ok:false, err:"Missing arguments"})
        const id = req.params.userId
        /** Check whether there is some kind of sus data, like some sql injection attack */
        if ((await sanitize(id) < 0))
            return res.status(403).json({ok:false, err:"Forbidden character failed"});
      
        /** Call the mysql to retrieve the data */
        await permanentStorage.getUserById(id, (e, d) =>
        {
            if(e) 
            {
                log(e, false);
                return res.status(500).json({ok:false, err:"Internal error"})
            }
                
            if (!d)
                return res.json({ok:false, err:"User not found"})
            return res.json({ok:true, data:d})
      });
    },
    updateUserInfo: async function (req, res, next)
    {
        /**
         * Note: Password don't came here, there is a separated route for it!
         */
        /** First of all, is you authenticated? */
        if (!(req.cookie && req.cookie.uid))
            return res.status(403).json({ok:false, err:"Should be authenticated"});
        if (!(req.body && req.body.email && req.body.name && req.body.metaInfo && req.body.age))
            return res.status(400).json({ok:false, err:"Missing new data"})
        
        const cookie = req.cookie.uid;
        if ((await sanitize(cookie)) < 0)
            return res.status(400).json({ok:false, err:"Forbidden characters found"});

        var email, name, metaInfo, age;
        /** Verify each field, and copy it */
        /** 
         * Note: Why so many verifications? That data will be directly inserted in database, if
         * anything goes wrong, our database can break, so make sure only the secure information goes in
         */
        if ((sanitize(req.body.email, true) > 0)) email = req.body.email; else return res.status(400).json({ok:false, err:"Forbidden characters found"});
        if ((sanitize(req.body.age) > 0))  age = req.body.age; else return res.status(400).json({ok:false, err:"Forbidden characters found"});
        if ((sanitize(req.body.name) > 0))  name = req.body.name; else return res.status(400).json({ok:false, err:"Forbidden characters found"});
        if ((sanitize(req.body.metaInfo) > 0))  metaInfo = req.body.metaInfo; else return res.status(400).json({ok:false, err:"Forbidden characters found"});
        
        /** What is your internal id? */
        const uid = statusDb.lookUpCookie(req.cookie.uid)
        /** Let's update, then */
        permanentStorage.updateUser([name, age, email, metaInfo, uid], (e, r) =>
        {
            if(e)
            {
                log(e, false);
                return res.status(500).json({ok:false, err:"Internal error"})
            }
            return res.status(200).json({ok:true});
        });
    },
    getUserMetaInfoByName: async function(req, res, next) 
    {
        // This probably will never happens, thanks to the fallback above.
        // But... Who knows? It's better just prevent...
        if(!req.params || !req.params.userName)
            return res.status(403).json({ok:false, err:"Missing arguments"})
        const name = req.params.userName
        /** Check whether there is some kind of suspicius data, like some sql injection attack */
        if ((await sanitize(name) < 0))
            return res.status(403).json({ok:false, err:"Forbidden character failed"});
      
        /** Call the mysql to retrieve the data */
        await permanentStorage.getUserByName(name, (e, d) =>
        {
            if(e)
            {
                log(e, false);
                return res.status(500).json({ok:false, err:"Internal error"})
            }
            if (!d)
                return res.json({ok:false, err:"User not found"})
            return res.json({ok:true, data:d})
      });
    },
    getUserMetaInfoByEmail: async function(req, res, next) 
    {
        // This probably will never happens, thanks to the fallback above.
        // But... Who knows? It's better just prevent...
        if(!req.params || !req.params.email)
            return res.status(403).json({ok:false, err:"Missing arguments"})
        const email = req.params.email
        /** Check whether there is some kind of suspicius data, like some sql injection attack */
        if ((await sanitize(email, true) < 0))
            return res.status(403).json({ok:false, err:"Forbidden character failed"});
      
        /** Call the mysql to retrieve the data */
        await permanentStorage.getUserByEmail(email, (e, d) =>
        {
            if(e)
            {
                log(e, false);
                return res.status(500).json({ok:false, err:"Internal error"})
            }
            if (!d)
                return res.json({ok:false, err:"User not found"})
            return res.json({ok:true, data:d})
      });
     
    },
    logIn: async function(req, res, next)
    {
        /** This is a problem in the frontend, a logged one don't need re-log */
        if(req.cookie && req.cookie.uid)
            return res.status(400).json({ok:false, err:"Already logged"})

        /** Return exactly what is missing, for debug */
        if(!(req.body))
            return res.status(400).json({ok:false, err:"Missing body"})
        if(!(req.body.password))
            return res.status(400).json({ok:false, err:"Missing password"})
        if(!(req.body.email))
            return res.status(400).json({ok:false, err:"Missing email"})
        /** Call the Database */
        permanentStorage.authenticate([req.body.email, req.body.password], async function(e, d)
        {
            if(e)
            {
                log(e, false);
                return res.status(500).json({ok:false, err:"Internal error"})
            }
            if(!d)
                return res.status(302).json({ok:false, err:"User not exist in"})
            /** Success? Great! Create a cookie and start the session */
            let cookie = await statusDb.createCookie(d.id);
            res.status(200).json({ok:true, cookie:cookie})
        })
    },
    getUserInfo: async function(req, res, next) 
    {

        /** This request is only possible for logged ones */
        if (!(req.cookies && req.cookies.userId))
            return res.status(403).json({ok:false, err:"Missing cookie"});
        const cookie = req.cookies.userId;
    
        /** Check whether there is some kind of sus data, like some sql injection attack */
        if ((await sanitize(cookie) < 0))
            return res.status(403).json({ok:false, err:"Forbidden character"});

        statusDb.validateCookie(cookie, async function (e, d)
        {
            /** Verify if the uid exists and belong to the authenticated user */  
            if(e)
            {
                log(e, false);
                return res.status(500).json({ok:false, err:"Internal error"})
            }
            if(!d || !d[0] || !d[0].uid) return res.status(403).json({ok:false, err:"Must be logged to do this"});
            if(sanitize(d[0].uid) < 0) return res.status(403).json({ok:false, err:"Forbidden character"});
            
            /** If all happens well, return the values */
            await permanentStorage.getUserPrivateInfoById(d[0].uid, (e, r) =>
            {
                if(e)
                {
                    log(e, false);
                    return res.status(500).json({ok:false, err:"Internal error"})
                }
                if(r) return res.status(200).json({ok:true, data:r});
            });

        });
    },
    logOut: async (req, res, next) =>
    {
        if(!(req.cookie && req.cookie.userId))
            return res.status(403).json({ok:false, err:"Missing cookie"})
        
        const cookie = req.cookie.userId;
        
        if((await sanitize(cookie)) < 0)
            return res.status(400).json({ok:false, err:"Forbidden character"});
        
        if(statusDb.deleteCookie(cookie))
            return res.status(200).json({ok:true});
        
        if(e)
        {
            log(e, false);
            return res.status(500).json({ok:false, err:"Internal error"})
        }

    },
    createUser: async function (req, res, next)
    {

        if(!req.body)
            return res.json({ok:false, err:"Missing args"});
        
        let userInfo = baseUser;
        const b = req.body

        if(!b.name || !b.age || !b.password || !b.email || !b.metaInfo)
            return res.status(400).json({ok:false, err:"Missing information"});

        /* Manually copy each field, for security reasons */
        if(sanitize(b.name)>0) userInfo.name = b.name; else return res.status(400).json({ok:false, err:"Invalid character found name"});
        if(sanitize(b.age)>0) userInfo.age = b.age; else return res.status(400).json({ok:false, err:"Invalid character found age"});
        if(sanitize(b.password) > 0) userInfo.password = b.password; else return res.status(400).json({ok:false, err:"Invalid character found pass"});
        if(sanitize(b.email, true) > 0) userInfo.email = b.email; else return res.status(400).json({ok:false, err:"Invalid character found email"});
        if(sanitize(b.metaInfo) > 0) userInfo.metaInfo = b.metaInfo; else return res.status(400).json({ok:false, err:"Invalid character found metainfo"});

        permanentStorage.createUser(userInfo)
        .then(()=>{

            return res.status(200).json({ok:true});
        }).catch((e, d) =>
        {
            if(e)
            {
                log(e, false);
                return res.status(500).json({ok:false, err:"Internal error"})
            }
            if(e == 400)
                return res.status(400).json({ok:false, err:"Bad request"});
        });
    }
}