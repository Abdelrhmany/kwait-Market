

require("dotenv").config();
const cors = require('cors');

const express = require('express');
const mongoose = require('mongoose');
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const itemRoutes = require('./routes/items');

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());

// إعداد الجلسات
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

// إعداد Passport
app.use(passport.initialize());
app.use(passport.session());

// إعداد استراتيجية Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ميدل وير للتأكد من تسجيل الدخول
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

// المسارات
app.get("/", (req, res) => {
  res.send(`
    <h1>Welcome</h1>
    <a href='/auth/google'>Login with Google</a>
  `);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get("/profile", ensureAuthenticated, (req, res) => {
  res.send(`
    <h1>Hello, ${req.user.displayName}</h1>
    <form action="/post-data" method="POST">
      <label for="data">Enter some data:</label>
      <input type="text" id="data" name="data" required />
      <button type="submit">Submit</button>
    </form>
    <a href="/logout">Logout</a>
  `);
});

app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// المسارات الخاصة بالإعلانات
app.use('/items', itemRoutes);

// بدء السيرفر وربطه مع قاعدة البيانات
mongoose
  .connect('mongodb://localhost:27017/yourdbname', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected successfully!');
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => console.log(err));