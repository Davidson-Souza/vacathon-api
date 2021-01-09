const mysql = require('mysql');
const conf = require("../config.json").mysql;
const log = require("../log");
var db, isWorking = false;

/** Try connect to Mysql */
function startMysql()
{
  log("trying to start Mysql")
  db = mysql.createConnection(conf);
  
  db.on("error", (e) =>
  {
    if(e.code == "PROTOCOL_PACKETS_OUT_OF_ORDER") isWorking = false;
  });

  try
  {
    db.connect(function(err) {
      if (err && err.errno == -111) log("Mysql is down", true);
      else
      {
        log("Mysql is now connected!");
        isWorking = true; 
      }
    });
  }catch(e)
  {
    log(e)
  }
}
startMysql();


exports.db = 
{
  getUserAnalyze: (uid, next) =>
  {
    if (!isWorking)
    {
      /** 
        * If the Mysql connection is closed, try reopen
        * Note: If the connection is down, only revalidate after one request. Reduces 
        * redundant requests.
        */
      startMysql();
      return next(500, "Mysql isn't work");
    }
    db.query(`SELECT "imageId" FROM "analyze" WHERE "ownerId"=?`,[uid], function (err, result, fields)
    {
      if (err != null)
      {
        if(err.errno == -111) isWorking = false 
        return next(true, err);
      }
      next(false, result)
    });

  },
  getUserById: (uid, next) =>
  {   
      if (!isWorking)
      {
        /** 
          * If the Mysql connection is closed, try reopen
          * Note: If the connection is down, only revalidate after one request. Reduces 
          * redundant requests.
          */
        startMysql();
        return next(500, "Mysql isn't work")
      }

    db.query(`SELECT name, metaInfo FROM profile WHERE id="?"`,[uid], function (err, result, fields) {
        if (err != null)
        {
          if(err.errno == -111) isWorking = false 
          next(true, err);
        }
        next(false, result[0])
      });
  },
  updateUser:(user, next) =>
  {
    if (!isWorking)
    {
      startMysql();
      return next(500, "Mysql isn't work")
    }
    db.query(`UPDATE profile SET name="?", type="?", email="?", metaInfo="?" WHERE id="?"`,user, function (err, result, fields) {
      if (err != null)
      {
        if(err.errno == -111) isWorking = false 
        next(true, err);
      }
      next(false, {ok:true});
    });
  },
  getUserPrivateInfoById:(uid, next) =>
  {
    if (!isWorking)
    {
      startMysql();
      return next(500, "Mysql isn't work")
    }
    db.query(`SELECT name, id, type, email, metaInfo FROM profile WHERE id="?"`,[uid], function (err, result, fields) {
    if (err != null)
    {
      if(err.errno == -111) isWorking = false 
      next(true, err);
      }
      next(false, result[0])
    });
  },
  updateUserPassword: (info, next) =>
  {
    if (!isWorking)
    {
      startMysql();
      return next(500, "Mysql isn't work")
    }
    db.query(`UPDATE profile SET password="?" WHERE password="?" AND id="?"`,info, function (err, result, fields) {
      if (err != null)
      {
        if(err.errno == -111) isWorking = false 
        next(true, err);
      }
      else next(false, {ok:true});
    });
  },
  authenticate:(info, next) =>
  {
    if (!isWorking)
    {
      startMysql();
      return next(500, "Mysql isn't work")
    }
    db.query(`SELECT id FROM profile WHERE email="?" AND password="?"`,info, function (err, result, fields) {
      if (err != null)
      {
        if(err.errno == -111) isWorking = false 
        next(true, err);
      }
      if (result.size == 0) next(false,{res: "User not found!"});
      next(false, result[0])
    });
  },
  getUserByEmail:(email, next)=>
  {
    if (!isWorking)
    {
      startMysql();
      return next(500, "Mysql isn't work")
    }
    db.query(`SELECT name, type, metaInfo FROM profile WHERE email="?"`,[email], function (err, result, fields) {
      if (err != null)
      {
        if(err.errno == -111) isWorking = false 
        next(true, err);
      }
      else
        next(false, result[0])
    });
  },
  getUserByName:(name, next)=>
  {
    if (!isWorking)
    {
      startMysql();
      return next(500, "Mysql isn't work")
    }
    db.query(`SELECT name, type, metaInfo FROM profile WHERE name="?"`,[name], function (err, result, fields) {
      if (err != null)
      {
        if(err.errno == -111) isWorking = false 
        next(true, err);
      }
      else
        next(false, result[0])
    });
  },
  deleteUser:(u, next) =>
  {
    if (!isWorking)
    {
      startMysql();
      return next(500, "Mysql isn't work")
    }
    db.query(`DELETE FROM profile WHERE id="?"`, u , function (err, result, fields) {
      if (err != null)
      {
        if(err.errno == -111) isWorking = false 
        next(err, err);
      }
      else
        next(false, {ok:true});

    });
  },
  createUser:(u, next) =>
  {
    /** accept, reject (a, r) */
    return new Promise((a, r) =>
    {
      /** Is the database running? */
      if (!isWorking)
      {
        startMysql();
        return r(500, "Mysql isn't work")
      }

      /** Double check it, we really don't want to break our database */
      if(!(u && u.name && !(u.type == undefined) && u.password && u.email && u.metaInfo))
        r(400, "Missing information");
      db.query(`INSERT INTO profile(name, type, password, email, metaInfo) VALUES("?", "?", "?", "?", "?")`, [u.name, u.type?1:0, u.password, u.email, u.metaInfo], (err, v, f) =>
      {
        if (err != null)
        {
          if(err.errno == -111) isWorking = false 
          r(err);
        }
        a()
      });
    })
  },
  createAnalyze:function(u, next)
  {
    /** accept, reject (a, r) */
    
      /** Is the database running? */
      if (!isWorking)
      {
        startMysql();
        log("Fail to create new analyze, mysql isn't working!", false);
        next(true);
        return ;
      }
      /** Double check it, we really don't want to break our database */
      if(!(u && u.imgName && u.ownerId))
      {
        log("Fail to create new analyze, missing information", false);
        next(true);
        return ;
      }
      db.query(`INSERT INTO "analyze"("imageId", "ownerId") VALUES("?", "?")`,[u.imgName, u.ownerId],  (err, v, f) =>
      {
        if (err != null)
        {
          log(err)
          if(err.errno == -111) isWorking = false 
          return next(true);
        }
        next(false);
      });
  }
}