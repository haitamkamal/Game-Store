const express = require('express');
const app = express();
const path = require("path");
const authorRouter = require('./routes/authorRouter');
const passport = require('./config/passportConfig');
const session = require('express-session');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'your-secret-key', // Replace with a secure secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());


app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


app.use("/", authorRouter);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});