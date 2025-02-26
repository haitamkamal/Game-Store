const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { getUserByEmail, getUserById } = require("../db/query");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        console.log("Looking for user:", email);
        const user = await getUserByEmail(email);
        if (!user) {
          console.log("User not found");
          return done(null, false, { message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          console.log("Wrong password");
          return done(null, false, { message: "Wrong password" });
        }

        console.log("User authenticated:", user.email);
        return done(null, user);
      } catch (err) {
        console.error("Error in authentication:", err);
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    done(null, user); 
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;