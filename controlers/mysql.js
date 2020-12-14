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
    loadUserQuery:"SELECT * FROM profile WHERE id=1",
    createUserQuery:"INSERT INTO profile(name, age, hashedPassword, email, metaInfo) VALUES(?, ?, ?, ?, ?)",
    getUser: (uid, next) =>
    {   
        let res = false;
        con.query(this.loadUserQuery,[uid], function (err, result, fields) {
          if (err != null) return false;
          next(result[0])
        });
    },
    createUser:function(u)
    {
      return new Promise((a, r) =>
      {
        if(!(u && u.name && u.age && u.hashedPassword && u.email && u.metaInfo))
          r(400, "Missing information");
        con.query(this.createUserQuery, [u.name, u.age, u.hashedPassword, u.email, u.metaInfo], (e, v, f) =>
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