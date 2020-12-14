var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", 
  database:"users"
});
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected! to mysql");
});

exports.db = 
{
    loadUserQuery:"SELECT * FROM profile WHERE id=?",
    createUserQuery:"INSERT INTO profile(name, age, password, email, metaInfo) VALUES(?, ?, ?, ?, ?)",
    getUser: (uid, next) =>
    {   
        con.query("SELECT * FROM profile WHERE id=?",[uid], function (err, result, fields) {
          if (err != null) return false;
          next(false, result[0])
        });
    },
    getUserByName:(name, next)=>
    {
      con.query("SELECT * FROM profile WHERE email=?",[name], function (err, result, fields) {
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
        if(!(u && u.name && u.age && u.password && u.email && u.metaInfo))
          r(400, "Missing information");
        con.query(this.createUserQuery, [u.name, u.age, u.password, u.email, u.metaInfo], (e, v, f) =>
        {
          if(e)
          {
            console.log(e)
            r(500, "Internal error");
          }
          a()
        });
      })
    }
}