const { userModel, userValidate } = require("../models/user-models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/nodemailer");
const crypto = require("crypto");

module.exports.createUser = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;

    let err = userValidate({ name, email, password });
    if (err) {
      return res.status(400).json({
        validationError: err.details.map((err) => err.message),
      });
    }

    // Check if the user is already registered
    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "User already registered. Please log in.",
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    let createdUser = await userModel.create({
      email,
      name,
      password: hashedPassword, // Store the hashed password
    });

    // Generate JWT token for the created user
    let token = jwt.sign({ email, id: createdUser._id }, process.env.JWT_SECRET);

    // Set the JWT token as a cookie
    res.cookie("token", token);
    
    return res.status(201).json({
      message: "User created successfully",
      user: createdUser,
    });
  } catch (error) {
    console.error("Error creating user:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports.loginUser = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email: email }).select("+password");
    if (!user) {
      return res.status(400).json({ error: "Username or password incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      let token = jwt.sign({ email, id: user._id }, process.env.JWT_SECRET);
      res.cookie("token", token);
      return res.status(200).json({
        message: "Successfully logged in",
        user,
      });
    } else {
      return res.status(400).json({ error: "Username or password incorrect" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports.logoutUser = async (req, res, next) => {
  try {
    res.cookie("token", "");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports.passwordResetUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (user) {
      const otp = crypto.randomInt(100000, 999999).toString();

      // Save OTP and email in session
      req.session.otp = otp;
      req.session.verifiedEmail = email;
      req.session.otpExpire = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes

      await sendMail(email, otp); // Send OTP to email
      return res.status(200).json({ message: "OTP sent successfully" });
    } else {
      return res.status(404).json({ error: "This email does not exist" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports.otyVerifyUser = async (req, res, next) => {
  try {
    const enteredOtp = req.body.otp;
    const expectedOtp = req.session.otp;
    const otpExpire = req.session.otpExpire;

    if (Date.now() > otpExpire) {
      return res.status(400).json({ error: "OTP has expired. Please request a new OTP." });
    }

    if (enteredOtp === expectedOtp) {
      req.session.isOtpVerified = true;
      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ error: "OTP is incorrect" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports.passwordUpdateUser = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (req.session.verifiedEmail) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await userModel.findOneAndUpdate(
        { email: req.session.verifiedEmail },
        { password: hashedPassword },
      );

      req.session.verifiedEmail = null;
      req.session.isOtpVerified = null;
      req.session.otp = null;

      return res.status(200).json({ message: "Password reset successfully" });
    } else {
      return res.status(400).json({ error: "User has not verified email" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports.updateProfileUser = async (req, res, next) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    let { buffer, mimetype } = req.file;
    user.profilepicture = buffer;
    user.imageMimeType = mimetype;
    await user.save();
    return res.status(200).json({ message: "Profile picture updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update profile picture" });
  }
};

module.exports.checkUserexist = async (req, res, next) => {
  try {
    let { username, name, email } = req.body;

    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists!" });
    }

    const existingName = await userModel.findOne({ name });
    if (existingName) {
      return res.status(400).json({ message: "Name already exists!" });
    }

    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered!" });
    }

    return res.status(200).json({ message: "All fields are available!" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

module.exports.resendOtp = async (req, res, next) => {
  try {
    const email = req.session.verifiedEmail;

    if (!email) {
      return res.status(400).json({ success: false, message: "No email found in session." });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    req.session.otp = otp;
    req.session.otpExpire = Date.now() + 5 * 60 * 1000;

    await sendMail(email, otp);

    return res.status(200).json({ success: true, message: "OTP has been resent." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error resending OTP." });
  }
};

module.exports.testuser = async (req, res, next) => {

    res.send("helooo")
  };



