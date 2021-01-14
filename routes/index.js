var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.end("<a href='specklefqormilk:jfdkfje'>aqui</a>");
  res.json({ok:false, err:"Method not allowed!", r:res.finished});
});

module.exports = router;
