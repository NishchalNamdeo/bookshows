const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user-models");

function auth() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("Google profile:", profile); // Logging profile for debugging

          let user = await userModel.findOne({ googleId: profile.id });
          if (!user) {
            // If user does not exist, create one
            user = await userModel.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              username: profile.emails[0].value.split("@")[0],
              password: process.env.PASSWORD_GOOGLE, // Dummy password, adjust as needed
              profileImage: profile.photos[0].value, // Save the profile image URL
            });
          }

          // Generate JWT token after successful login
          const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
          );

          return done(null, { user, token }); // Pass user and token to the done function
        } catch (error) {
          console.error("Error during Google OAuth:", error);
          return done(error, null);
        }
      },
    ),
  );

  // Serialize user for session
  passport.serializeUser((userObj, done) => {
    console.log("Serializing user:", userObj.user._id); // Debugging
    done(null, userObj.user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      console.log("Deserializing user:", user); // Debugging
      done(null, user);
    } catch (error) {
      console.error("Error deserializing user:", error);
      done(error, null);
    }
  });
}

module.exports = auth;
