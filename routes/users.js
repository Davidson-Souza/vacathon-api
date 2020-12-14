var express = require('express');
var router = express.Router();
const permanentStorage = require("./mysql").db
const statusDb = require("./sqlite").db

/** Verify if a passed string is potentially harmful */
function sanitize(str)
{
  if (str == null || str == undefined || str.length>100)
    return -1;
  for (let i = 0; i < str.length; i++)
    if(str.charAt(i) < '0' || str.charAt(i) > 'z')
      return -1;
  return 1;
}

/** Catch a malformed request */
router.get('/getUserMetaInfo/', async function(req, res, next) 
{
  return res.status(403).json({ok:false, err:"Missing id param"})
});

/* GET user public information */
router.get('/getUserMetaInfo/:userId', async function(req, res, next) 
{
  const id = req.params.userId
  /** Check whether there is some kind of suspicius data, like some sql injection attack */
  if ((await sanitize(id) < 0))
    return res.status(403).json({ok:false, err:"Forbidden character failed"});
  
  /** Call the mysql to retrieve the data */
  await permanentStorage.getUser(id, (d) =>
  {
    //TODO: catch errors appropriately.
    if (!d)
      return res.json({ok:false, err:"User not found!"})
    return res.json({ok:true, data:d})
  });
 
});

/* GET user profile info. */
/* 
  Note: One user can ONLY get information about yourself, for getting cosmetic data about
  anyone else, use get getUserMetaInfo - see docs/routes.md for details
*/
router.get('/getUserInfo', async function(req, res, next) 
{
  /** This request is only possible for logged ones */
  if (!(req.cookies && req.cookies.userId))
    return res.status(403).end("Missing cookie");

  const id = req.cookies.userId;

  /** Check whether there is some kind of suspicius data, like some sql injection attack */
  if ((await sanitize(id) < 0))
    return res.status(403).end("Forbidden character failed");
  statusDb.validateCookie(req.cookies.userId)
});


//TODO: implement more routes
module.exports = router;
