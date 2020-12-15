var mysql = require('mysql');
var conf = require("../config.json").mysql;

console.log("trying to start Mysql")
const db = mysql.createConnection(conf);

try
{
  db.connect(function(err) {
    if (err) return -1;
    console.log("Mysql is now connected!");
});
}catch(e)
{
  console.log(e)
}
let isWorking = true;
exports.db = 
{
    isWorking,
    getUserById: (uid, next) =>
    {   
        if (!this.db.isWorking)
          return -1;
        db.query("SELECT name, metaInfo FROM profile WHERE id=?",[uid], function (err, result, fields) {
          if (err != null) next(true, err);
          next(false, result[0])
        });
    },
    getUserPrivateInfoById:(uid, next) =>
    {
      if (!this.db.isWorking)
        return -1;
      db.query("SELECT name, age, password, email, metaInfo FROM profile WHERE id=?",[uid], function (err, result, fields) {
        if (err != null) next(true, err);
        next(false, result[0])
      });
    },
    authenticate:(info, next) =>
    {
      if (!this.db.isWorking)
        return -1;
      db.query("SELECT id FROM profile WHERE email=? AND password=?",info, function (err, result, fields) {
        if (err != null) next(true, err);
        if (result.size == 0) next(false,false);
        next(false, result[0])
      });
    },
    getUserByEmail:(email, next)=>
    {
      if (!this.db.isWorking)
        return -1;
      db.query("SELECT name, metaInfo FROM profile WHERE email=?",[email], function (err, result, fields) {
        if (err != null)
          next(err);
        else
          next(false, result[0])
      });
    },
    getUserByName:(name, next)=>
    {
      if (!this.db.isWorking)
        return -1;
      db.query("SELECT name, metaInfo FROM profile WHERE name=?",[name], function (err, result, fields) {
        if (err != null)
          next(err);
        else
          next(false, result[0])
      });
    },
    createUser:function(u)
    {
      /** accept, reject (a, r) */
      return new Promise((a, r) =>
      {
        /** Is the database running? */
        if (!this.isWorking)
          r(500, "Internal error");

        /** Double check it, we really don't want to break our database */
        if(!(u && u.name && u.age && u.password && u.email && u.metaInfo))
          r(400, "Missing information");

        db.query("INSERT INTO profile(name, age, password, email, metaInfo) VALUES(?, ?, ?, ?, ?)", [u.name, u.age, u.password, u.email, u.metaInfo], (e, v, f) =>
        {
          if(e)
          {
            console.log(e)
            //1065 - empty query
            //TODO: Log it
            r(500, "Internal error");
          }
          a()
        });
      })
    }
}