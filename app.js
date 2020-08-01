require('dotenv').config(); // environment variable
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// initialized session
app.use(session({
    secret: "rahasia kita",
    resave: false,
    saveUninitialized: true,
}));

// initialized passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

// passport-local mongoose configuration
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.get("/secrets", function(req, res) {
    if (req.isAuthenticated()) { // use cookie, so when already login doesnt need to log back in
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function(req, res) {
    // deauthenticate our user and end user session
    req.logout(); // passport logout() function
    res.redirect("/");
});

app.post("/register", function(req, res) {
  User.register({username: req.body.username}, req.body.password, function(err, user) { // passport-local mongoose register() function
      if (err) {
          console.log(err);
          res.redirect("/register");
      } else {
          passport.authenticate("local")(req, res, function() {
              res.redirect("/secrets");
          });
      }
  })
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body. password
    });
    req.login(user, function(err) { // passport login() function
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            });
        }
    })
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});