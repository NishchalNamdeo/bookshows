require('dotenv').config()
const express = require('express')
const app = express()
const userRouter = require('./routes/userRoutes')
const adminRouter = require('./routes/adminRoutes')
const movieRouter = require('./routes/movieRoutes')
const theaterRouter = require('./routes/theaterRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const paymentRouter = require('./routes/paymetRoutes')
const db = require("./config/mongoose-connection")
// const db = require("./config/mongoose-connection")
const path = require("path");
const cookieParser = require("cookie-parser");
const flash = require('connect-flash')
const expressSession = require('express-session')
const googleRoutes = require("./routes/google-auth-Routes")
const auth = require("./utils/googleAuth")


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.use(flash());
// Setup session middleware
app.use(expressSession({
    secret: 'your-secret-key', // Replace this with a secure key
    resave: false,
    saveUninitialized: true,
  }));

  auth()
  
  // Your other middlewares like body-parser, etc.



app.use("/", userRouter)
app.use("/admin", adminRouter)
app.use("/movie",movieRouter )
app.use("/theater", theaterRouter)
app.use("/booking", bookingRouter)
app.use("/payment", paymentRouter)
app.use("/auth", googleRoutes)



app.listen(process.env.PORT || 3000)