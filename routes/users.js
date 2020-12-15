var express = require('express');
var router = express.Router();
var controler = require("../controlers/users").default;

/** Catch a malformed request */
router.get('/', controler.missingParam);


/* GET user public information */
router.get('/getUserById/:userId',controler.getUserMetaInfoById );
router.get('/getUserByName/:userName', controler.getUserMetaInfoByName)
router.get('/getUserByEmail/:email', controler.getUserMetaInfoByEmail)
/* GET user profile info. */
/* 
  Note: One user can ONLY get information about yourself, for getting cosmetic data about
  anyone else, use get getUserMetaInfo - see docs/routes.md for details
*/
router.get('/getUserInfo', controler.getUserInfo);

/* Create a new user, aka signup */
router.post('/createUser/',controler.createUser)

/* Login an user */
router.post("/authenticateUser/", controler.logIn)
//TODO: implement more routes
module.exports = router;
