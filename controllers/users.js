/**
 * Control everthing related to users
 * @author Davidson Souza
 * @date December, 2020
 * @copyright Davidson Souza, 2020-2021
 * @license MIT
 */

const permanentStorage = require("./mysql").db;
const statusDb         = require("./leveldb").db;
const log              = require("../log");
const mail             = require("./mail").default;
const utilities        = require("../utilities").default
const sanitize         = utilities.sanitize
const sha256d          = utilities.sha256d

/** How a user should looks like */
const baseUser = 
{
    name:0, type:0, password:0, email:0, metaInfo:0
}

exports.default = 
{
    missingParam: async (req, res, next) => 
    {
      return res.status(403).json({ok:false, err:"Missing id param"})
    },
    uploadProfileImage:(req, res, next) =>
    {
        if(!(req.file && req.cookies && req.cookies.uid && req.files.profileImg))
            return res.status(400).json({ok:false, err:"Missing information"});
        
        const cookie = req.cookies.uid;
        this.default.isAuthenticated(cookie)
            .then( d =>
            {
                permanentStorage.setProfileImage(d, req.file.filename, (err, data) =>
                {
                    if(err)
                    {
                        return res.status(500).json({ok:false, err:"Internal error"});
                    }
                    return res.status(200).json({ok:true});
                });
            })
            .catch(e =>
                {
                    if(e)
                    {
                        log(e);
                        return res.status(500).json({ok:false, err:"Internal error"});
                    }
                });
    },
    requestConfirmationCode: async (req, res, next) =>
    {
        /** This request is only possible for logged ones */
        if (!(req.cookies && req.cookies.uid))
            return res.status(403).json({ok:false, err:"Missing cookie"});
        const cookie = req.cookies.uid;
    
        /** Check whether there is some kind of sus data, like some sql injection attack */
        if ((await sanitize(cookie) < 0))
            return res.status(400).json({ok:false, err:"Forbidden character"});

        this.default.isAuthenticated(cookie)
        .then( async (d) =>
        {

            /** Verify if the uid exists and belong to the authenticated user */  
            if(!d)
            {
                log(d, false);
                return res.status(500).json({ok:false, err:"Internal error"})
            }

            /** If all happens well, return the values */
            permanentStorage.getUserPrivateInfoById(d, async (e, r) =>
            {
                if(e)
                {
                    log(e, false);
                    return res.status(500).json({ok:false, err:"Internal error"})
                }
                if(r)
                {
                    const cookie = await statusDb.createCookie(d, 2)
                    if(typeof(cookie) == "string")
                    {
                        console.log(e)
                        mail.sendMail(
                        {
                            to: r.email,
                            from: process.env.MAIL_FROM, 
                            subject: 'Código de confirmação',
                            text: `Este é o seu código de confirmação para a aplicação ${cookie}`,
                            html: `Clique <a href="${process.env.HOST}/api/v1/users/verifyCode/${cookie}">aqui </a> para validar o seu email`,
                        }, (err) =>
                        {
                            console.log(e)
                            if(err) return res.status(500).json({ok:false, err:"Internal error"});
                            else return res.status(200).json({ok:true});
                        });
                    };
                }
            });
        })
        .catch((e) =>
        {
            return res.status(403).json({ok:false, err:"Must be logged"});
        });
    },
    /** Used internally */
    isAuthenticated: (cookie) =>
    {
        return new Promise((accept, reject) =>
        {
            if(!cookie)
            {
                log("users::isAuthenticated: Missing cookie", true);
                return ;
            }

            statusDb.lookUpCookie(cookie, (d) =>
            {
                if(!d)
                    reject();
                /**If the user is authenticated return it's session information */
                accept(d);
            });
        });
    },
    verifyCode: (req, res, next) =>
    {
        const code = req.params.code;

        if(sanitize(code) < 0)
            return res.status(400).json({ok:false, err:"Forbidden character"});

        statusDb.lookUpCookie(code, r =>
            {
                if(!r)
                    return res.status(403).json({ok:false, err:"Wrong code"});
                permanentStorage.updateVerificationStatus(r, (err) =>
                {
                    if(err) return res.status(500).json({ok:false, err:"Internal error"});
                    else  return res.status(200).json({ok:true});
                })
            });
    },
    getUserMetaInfoById: async (req, res, next) => 
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
    updateUserInfo: async (req, res, next) =>
    {
        /**
         * Note: Password don't came here, there is a separated route for it!
         */
        /** First of all, is you authenticated? */
        if (!(req.cookies && req.cookies.uid))
            return res.status(403).json({ok:false, err:"Should be authenticated"});
        if (!(req.body && req.body.email && req.body.name && req.body.metaInfo && req.body.type))
            return res.status(400).json({ok:false, err:"Missing new data"})
        
        const cookie = req.cookies.uid;
        if ((await sanitize(cookie)) < 0)
            return res.status(400).json({ok:false, err:"Forbidden characters found"});

        var email, name, metaInfo, type;
        /** Verify each field, and copy it */
        /** 
         * Note: Why so many verifications? That data will be directly inserted in our database, if
         * anything goes wrong, our database can break, so make sure only the secure and required information goes in
         */
        if ((sanitize(req.body.email) > 0) && typeof(req.body.email) == "string") email = req.body.email; else return res.status(400).json({ok:false, err:"Forbidden characters found"});
        /** Booleans don't have characters */
        if (typeof(req.body.type) == "boolean")  type = req.body.type; else return res.status(400).json({ok:false, err:"Forbidden characters found"});
        if ((sanitize(req.body.name) > 0 && typeof(req.body.name) == "string"))  name = req.body.name; else return res.status(400).json({ok:false, err:"Forbidden characters found"});
        if ((sanitize(req.body.metaInfo) > 0) && typeof(req.body.metaInfo == "string"))  metaInfo = req.body.metaInfo; else return res.status(400).json({ok:false, err:"Forbidden characters found"});
        
        this.default.isAuthenticated(cookie)
            .then( d =>
                {
                    permanentStorage.updateUser([name, type, email, metaInfo, d], (e, r) =>
                    {
                        if(e)
                        {
                            log(e, false);
                            return res.status(500).json({ok:false, err:"Internal error"})
                        }
                        return res.status(200).json({ok:true});
                    });
                })

            .catch((e) =>
            {
                if(e)
                    log(e);
                return res.status(500).json({ok:false, err:"Internal error"})
            });
    },
    getUserMetaInfoByName: async (req, res, next)=> 
    {
        // This probably will never happens, thanks to the fallback above.
        // But... Who knows? It's better just prevent...
        if(!req.params || !req.params.userName)
            return res.status(403).json({ok:false, err:"Missing arguments"})
        const name = req.params.userName
        /** Check whether there is some kind of sus data, like some sql injection attack */
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
    getUserMetaInfoByEmail: async(req, res, next) =>
    {
        // This probably will never happens, thanks to the fallback above.
        // But... Who knows? It's better just prevent...
        if(!req.params || !req.params.email)
            return res.status(403).json({ok:false, err:"Missing arguments"})
        const email = req.params.email
        /** Check whether there is some kind of sus data, like some sql injection attack */
        if ((await sanitize(email) < 0))
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
    logIn: async (req, res, next) =>
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
        
        if(!(sanitize(req.body.email) > 0 && sanitize(req.body.password) > 0))
            return res.status(400).json({ok:false, err:"Forbidden characters"})
        const hashedPassword = await sha256d(req.body.password);
        /** Call the Database */
        permanentStorage.authenticate([req.body.email, hashedPassword], async function(e, d)
        {
            if(e)
            {
                log(e, false);
                return res.status(500).json({ok:false, err:"Login error"})
            }
            if(!d)
                return res.status(302).json({ok:false, err:"User not exist in"})
            /** Success? Great! Create a cookie and start the session */
            let cookie = await statusDb.createCookie(d.id);
            res.status(200).json({ok:true, cookie:cookie})
        })
    },
    getUserInfo: async (req, res, next) =>
    {
        /** This request is only possible for logged ones */
        if (!(req.cookies && req.cookies.uid))
            return res.status(403).json({ok:false, err:"Missing cookie"});
        const cookie = req.cookies.uid;
        /** Check whether there is some kind of sus data, like some sql injection attack */
        if ((await sanitize(cookie) < 0))
            return res.status(400).json({ok:false, err:"Forbidden character"});
        this.default.isAuthenticated(cookie)
            .then( d =>
                {
                   
                    /** If all happens well, return the values */
                    permanentStorage.getUserPrivateInfoById(d, (e, r) =>
                    {
                        if(e)
                        {
                            log(e, false);
                            return res.status(500).json({ok:false, err:"Internal error"})
                        }
                        /** 
                         * The database answer shold be consisent, prevent crazy replyes leaking
                         * some important data
                         */
                        if((!(sanitize(r.name) < 0 && sanitize(r.email) < 0 && sanitize(r.metainfo) < 0)))
                                return res.status(500).json({ok:false, data:"Internal error"});

                        return res.status(200).json({ok:true, data:
                            {
                                "name":r.name,
                                "type":r.type,
                                "email":r.email,
                                "metaInfo":r.metaInfo,
                                "profileImage":r.profilePic
                            }});
                    });
                })
            .catch( e =>
                {
                    if(e)
                        log(e);
                    return res.status(404).json({ok:false, err:"User not found"})
                })
    },
    logOut: async (req, res, next) =>
    {
        if(!(req.cookies && req.cookies.uid))
            return res.status(403).json({ok:false, err:"Missing cookie"})
        
        const cookie = req.cookies.uid;
        
        if((await sanitize(cookie)) < 0)
            return res.status(400).json({ok:false, err:"Forbidden character"});
        
        if(statusDb.deleteCookie(cookie))
            return res.status(200).json({ok:true});
    },
    createUser: async (req, res, next) =>
    {
        if(!req.body)
            return res.json({ok:false, err:"Missing args"});
        
        let userInfo = baseUser;
        const b = req.body
        if(!b.name || b.type==undefined || !b.password || !b.email || !b.metaInfo)
            return res.status(400).json({ok:false, err:"Missing information"});
        
        /* Manually copy each field, for security reasons */
        if(sanitize(b.name)>0          && typeof(b.name) == "string") userInfo.name = b.name; else return res.status(400).json({ok:false, err:"Invalid character found name"});
        if(/* Not sanitize bool */        typeof(b.type) == "boolean") userInfo.type = b.type; else return res.status(400).json({ok:false, err:"Invalid character found type"});
        if(sanitize(b.password         && typeof(b.password) == "string") < 0) return res.status(400).json({ok:false, err:"Invalid character found pass"});
        if(sanitize(b.email, true) > 0 && typeof(b.email) == "string") userInfo.email = b.email; else return res.status(400).json({ok:false, err:"Invalid character found email"});
        if(sanitize(b.metaInfo) > 0    && typeof(b.metaInfo) == "string") userInfo.metaInfo = b.metaInfo; else return res.status(400).json({ok:false, err:"Invalid character found metainfo"});
        
        /** Store the hash of the password, not the actual plain text */
        userInfo.password = await sha256d(b.password);
        permanentStorage.getUserByEmail(b.email, (e, r) =>
        {
            if(!r)
            {
                /** Create the user */
                permanentStorage.createUser(userInfo)
                    .then(()=>
                    {
                        return res.status(200).json({ok:true});
                    })
                .catch((e, d) =>
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
            else
            {
                return res.status(403).json({ok:false, err:"email already used"})
            }
        });
    },
    deleteUser: async (req, res, netx) =>
    {
        /**
         * Delete an user from database. This operation is irreversible!
         */
        /** First of all, is you authenticated? */
        if (!(req.cookies && req.cookies.userId))
            return res.status(403).json({ok:false, err:"Should be authenticated"});
        
        const cookie = req.cookies.userId;
        if ((await sanitize(cookie)) < 0)
            return res.status(400).json({ok:false, err:"Forbidden characters found"});

        this.default.isAuthenticated(cookie)
            .then( d =>
                {
                    permanentStorage.deleteUser(d, (e, r) =>
                    {
                        if(e)
                        {
                            log(e, false);
                            return res.status(500).json({ok:false, err:"Internal error"})
                        }
                        /**@todo remove files too */
                        return res.status(200).json({ok:true});
                    });
                })
                .catch( e =>
                    {
                        if(e)
                            log(e);
                        return res.status(500).json({ok:false, err:"Internal error"});
                    })
    },
    recoverPassword: async (req, res, next) =>
    {
        if(!(req.params && req.params.cookie))
            return res.status(403).json({ok:false, err:"Missing cookie"});
        const cookie = req.params.cookie;
        if(sanitize(cookie) < 0)
            return res.status(400).json({ok:false, err:"Forbidden character found"});
        
        statusDb.lookUpCookie(cookie, (uid) =>
        {
        
        })
    },
    getRecoverPassword: async (req, res, next) =>
    {
        if(!(req.body && req.body.email))
            return res.status(403).json({ok:false, err:"Missing mail"});
        const email = req.body.email;
        if(sanitize(email) < 0)
            return res.status(400).json({ok:false, err:"Forbidden character found"});
        permanentStorage.getUserId(email, async (err, res) =>
        {
            if(err || uid.length == 0)
                return res.status(404).json({ok:false, err:"Not found"});
            
            else
            {
                const id = res.id;
                const cookie = await statusDb.createCookie(id, 1);
                if(cookie)
                    mail.sendMail(
                        {
                            to: email,
                            from: process.env.MAIL_FROM, 
                            subject: 'Código de recuperação',
                            text: `Cline no link para recuperar o seu email`,
                            html: `Clique <a href="${process.env.HOST}/api/v1/users/verifyCode/${cookie}">aqui </a> recuperar a sua senha`,
                        }, (err) =>
                        {
                            if(err) return res.status(500).json({ok:false, err:"Internal error"});
                            else return res.status(200).json({ok:true});
                        });
            }     
        })
    },
    changePassword: async (req, res, next) =>
    {
        if(!(req.cookies && req.cookies.uid))
            return res.status(403).json({ok:false, err:"Must be logged"});
        if(!(req.body && req.body.newPassword && req.body.oldPassword))
            return res.status(400).json({ok:false, err:"Missing parameters"});
        
        if(sanitize(req.body.newPassword) < 0 || sanitize(req.cookies.uid) < 0 || sanitize(req.body.oldPassword) < 0)
            return res.status(400).json({ok:false, err:"Forbidden characters found"});
        const cookie = req.cookies.uid;
        /** Hash the old and the new password */
        const newPasswordHash = await sha256d(req.body.newPassword);
        const oldPasswordHash = await sha256d(req.body.oldPassword);

        /** What is your internal id? */
        this.default.isAuthenticated(cookie)
            .then( d =>
                {
                    permanentStorage.updateUserPassword([newPasswordHash, oldPasswordHash, d], (e, r) =>
                    {
                        if(e)
                        {
                            log(e, false);
                            return res.status(500).json({ok:false, err:"Internal error"})
                        }
                        else return res.status(200).json({ok:true});
                    });
                })
                .catch( e =>
                    {
                        if(e)
                            log(e);
                        return res.status(500).json({ok:false, err:"Internal error"})
                    })
    }
}
