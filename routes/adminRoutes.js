const express = require('express');
const router = express.Router();
const {createAdmin, admin, loginAdmin, logoutAdmin, resetAdmin, verifyOtp, resetPassword} = require("../controllers/adminControllers")




router.post("/create", createAdmin)
router.post("/login", loginAdmin)
router.post("/logout", logoutAdmin)
router.get("/", admin)
router.post("/resetpassword", resetAdmin); // Send OTP
router.post("/verify-otp", verifyOtp);               // Verify OTP
router.patch("/update-password", resetPassword);




module.exports = router


