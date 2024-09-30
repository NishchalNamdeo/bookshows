const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  if (req.cookies.token) {
    jwt.verify(
      req.cookies.token,
      process.env.JWT_SECRET,
      function (err, decoded) {
        if (err) {
          req.flash("error", "You need to login first");
          res.redirect("/");
        } else {
          req.user = decoded;
          next();
        }
      },
    );
  } else {
    req.flash("error", "You need to login first");
    res.redirect("/");
  }
}

function redirectIfLogin(req, res, next) {
  if (req.cookies.token) {
    res.redirect("/profile");
  } else next();
}

module.exports.isLoggedIn = isLoggedIn;
module.exports.redirectIfLogin = redirectIfLogin;
