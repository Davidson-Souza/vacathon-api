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
  anyone else, use get getUserMetaInfo - see docs/routes.md for details. Not password here, there is
  no reason to return password.
*/
router.get('/getUserInfo', controler.getUserInfo);

/* Create a new user, a.k.a signup */
router.post('/createUser/',controler.createUser)

/* Login an user */
router.post("/authenticateUser/", controler.logIn)

/* Logout user */
/*
  Note: The user to be logout is passed through the cookie, no more information needed
*/
router.get("/logout", controler.logOut)
// Update an existing user
router.post("/updateUser", controler.updateUserInfo)
// Change the user password, the user should exist and be authenticated.
/**
 * Note: The old password is required, for ensuring the ownership of the account
 */
router.post("/changeUserPassword", controler.changePassword)
// Delete an user from the system
/**
 * Note: This is irreversible!
 */
router.delete("/deleteUser", controler.deleteUser);
module.exports = router;
