var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.json({ok:false, err:"Method not allowed!", r:res.finished});
});

module.exports = router;
