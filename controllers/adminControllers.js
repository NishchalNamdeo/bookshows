const { adminModel, adminvalidator } = require("../models/admin-model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/nodemailer")

module.exports.createAdmin = async function(req, res, next) {
  try {
    let { username, email, password } = req.body;

    // Validate the request body using Joi
    let err = adminvalidator({
      username,
      email,
      password,
    });
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Check if any admin exists
    let adminexist = await adminModel.find();
    if (adminexist.length > 0) {
      return res.status(403).json("You don't have permission to create an admin.");
    }

    // Check if the admin with the same email already exists
    let admin = await adminModel.findOne({ email });
    if (admin) {
      return res.status(400).send({ error: "Admin with this email already exists" });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the admin
    let createdAdmin = await adminModel.create({
      username,
      email,
      password: hashedPassword, // Save the hashed password
    });

    // Generate JWT token after admin creation
    const token = jwt.sign(
      { _id: createdAdmin._id, email, role: 'admin' }, // Payload
      process.env.JWT_SECRET
    );

    // Set the token in cookies
    res.cookie("token", token);

    // Send the created admin and success message in the response
    res.status(201).json({
      message: "Admin created successfully",
      admin: createdAdmin,
    });

  } catch (error) {
    next(error); // Pass error to the next middleware (error handler)
  }
};
module.exports.logoutAdmin = async function(req, res, next) {
    try {
      // Clear the token from the cookies
      res.cookie("token", "");
  
      // Send a success response
      res.status(200).json({
        message: "Logged out successfully"
      });
  
    } catch (error) {
      next(error); // Pass the error to the next middleware (error handler)
    }
  };
  
module.exports.loginAdmin = async function(req, res, next) {
    try {
      const { email, password } = req.body;
  
      // Check if the admin with the given email exists
      const admin = await adminModel.findOne({ email }).select("+password");
      if (!admin) {
        return res.status(400).json({ error: "Invalid email or password." });
      }
  
      // Compare the provided password with the hashed password in the database
      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid email or password." });
      }
  
      // Generate JWT token for the admin
      const token = jwt.sign(
        { _id: admin._id, email, role: admin.role }, // Payload
        process.env.JWT_SECRET, // Secret key
      );
  
      // Set the token in cookies
      res.cookie("token", token);
  
      // Send a success response
      res.status(200).json({
        message: "Logged in successfully",
        admin
      });
  
    } catch (error) {
      next(error); // Pass the error to the next middleware (error handler)
    }
  };
module.exports.admin = function(req, res, next) {
  res.send("admin");
};


// Request password reset (Step 1: Send OTP)
module.exports.resetAdmin = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if the admin exists
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    req.session.otp = otp; // Store OTP in session
    req.session.email = email; // Store email in session
    

    // Send OTP via email
    await sendMail(email, otp);

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Verify OTP (Step 2: OTP Verification)
module.exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ error: "OTP is required" });
  }

  // Check if OTP matches the one stored in session
  if (otp !== req.session.otp || !req.session.email) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  // Mark OTP as verified
  req.session.otpVerified = true;

  // OTP is valid, allow password reset
  res.json({ message: "OTP verified, you can now reset your password" });
};

// Reset password (Step 3: Update password)
module.exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: "New password is required" });
  }

  try {
    const email = req.session.email;
    const otpVerified = req.session.otpVerified;

    if (!email) {
      return res.status(400).json({ error: "Session expired or email not found" });
    }

    if (!otpVerified) {
      return res.status(400).json({ error: "OTP verification is required before resetting the password" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the admin's password
    await adminModel.findOneAndUpdate({ email }, { password: hashedPassword });

    // Clear the session
    req.session.destroy();

    res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
