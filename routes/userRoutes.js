const express = require('express');
const router = express.Router();
const {createUser,checkUserexist,loginUser,logoutUser,passwordResetUser,passwordUpdateUser,otyVerifyUser,updateProfileUser, resendOtp, testuser} = require("../controllers/userControllers")
// const upload = require("../config/multer-config")
// const {passwordReset,passwordUpdate,profileUser,register,login,passwordVerify} = require("../controllers/user-get-controllers")
const {isLoggedIn,redirectIfLogin} = require("../middlewares/user-middlewares")


// const {ratelimiter, limiter}= require("../utils/ratelimiter")







router.post("/create",createUser)
router.post("/login",loginUser)
router.get("/logout",isLoggedIn,logoutUser )
router.post("/resetpassworduser", passwordResetUser); 
router.post("/verifyotp", otyVerifyUser);             
router.patch("/updatepassword",passwordUpdateUser);    
// router.post("/updateprofile",isLoggedIn,updateProfileUser);      
// router.post("/checkuser",checkUserexist);
router.post("/resendotp",resendOtp);
router.get("/",testuser);

// router.get("/profile",isLoggedIn,profileUser);     
// router.get("/",redirectIfLogin,login);     
// router.get("/register",redirectIfLogin,register);     
// router.get("/resetpassword",passwordReset);     
// router.get("/otpverify",passwordVerify);     
// router.get("/updatepassword",passwordUpdate);  













module.exports = router


