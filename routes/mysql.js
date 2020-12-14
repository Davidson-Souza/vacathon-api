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
    getUser: (uid, next) =>
    {   
        let res = false;
        res = con.query(this.db.loadUserQuery,[uid], function (err, result, fields) {
          if (err != null) return false;
          next(result[0])
        });
    }
}