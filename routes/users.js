var express = require('express');
var router = express.Router();
var controller = require("../controllers/users").default;
const upload = require("../controllers/storage");


/** Catch a malformed request */
router.get('/', controller.missingParam);


/* GET user public information */
router.get('/getUserById/:userId',controller.getUserMetaInfoById );
router.get('/getUserByName/:userName', controller.getUserMetaInfoByName)
router.get('/getUserByEmail/:email', controller.getUserMetaInfoByEmail)

/* GET user profile info. */
/* 
  Note: One user can ONLY get information about yourself, for getting cosmetic data about
  anyone else, use get getUserMetaInfo - see docs/routes.md for details. Not password here, there is
  no reason to return password.
*/
router.get('/getUserInfo', controller.getUserInfo);

/* Create a new user, a.k.a signup */
router.post('/createUser/',controller.createUser)

/* Login an user */
router.post("/authenticateUser/", controller.logIn)

/* Logout user */
/*
  Note: The user to be logout is passed through the cookie, no more information needed
*/
router.get("/logout", controller.logOut)
// Update an existing user
router.post("/updateUser", controller.updateUserInfo)
// Change the user password, the user should exist and be authenticated.
/**
 * Note: The old password is required, for ensuring the ownership of the account
 */
router.post("/changeUserPassword", controller.changePassword)
// Delete an user from the system
/**
 * Note: This is irreversible!
 */
router.delete("/deleteUser", controller.deleteUser);
// Update the user profile picture
router.patch("/setProfilePicture", upload.single("profilePic"),controller.uploadProfileImage);
router.get("/sendVerificationCode", controller.requestConfirmationCode);
router.get("/verifyCode/:code", controller.verifyCode);
module.exports = router;