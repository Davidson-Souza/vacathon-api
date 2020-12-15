var mysql = require('mysql');
var conf = require("../config.json").mysql;
var con = mysql.createConnection(conf);

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

exports.db = 
{
    getUserById: (uid, next) =>
    {   
        con.query("SELECT name, metaInfo FROM profile WHERE id=?",[uid], function (err, result, fields) {
          if (err != null) next(true, err);
          next(false, result[0])
        });
    },
    getUserPrivateInfoById:(uid, netx) =>
    {
      con.query("SELECT name, age, password, email, metaInfo FROM profile WHERE id=?",[uid], function (err, result, fields) {
        if (err != null) next(true, err);
        next(false, result[0])
      });
    },
    authenticate:(info, next) =>
    {
      con.query("SELECT id FROM profile WHERE email=? AND password=?",info, function (err, result, fields) {
        if (err != null) next(true, err);
        if (result.size == 0) next(false,false);
        next(false, result[0])
      });
    },
    getUserByEmail:(email, next)=>
    {
      con.query("SELECT name, metaInfo FROM profile WHERE email=?",[email], function (err, result, fields) {
        if (err != null)
          next(err);
        else
          next(false, result[0])
      });
    },
    getUserByName:(name, next)=>
    {
      con.query("SELECT name, metaInfo FROM profile WHERE name=?",[name], function (err, result, fields) {
        if (err != null)
          next(err);
        else
          next(false, result[0])
      });
    },
    createUser:function(u)
    {
      return new Promise((a, r) =>
      {
        /** Double check it, we really don't want to break our database */
        if(!(u && u.name && u.age && u.password && u.email && u.metaInfo))
          r(400, "Missing information");
        con.query(this.createUserQuery, [u.name, u.age, u.password, u.email, u.metaInfo], (e, v, f) =>
        {
          if(e)
          {
            //TODO: Log it
            r(500, "Internal error");
          }
          a()
        });
      })
    }
}