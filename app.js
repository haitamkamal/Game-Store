const express = require('express');
const fileUpload = require("express-fileupload");
const path = require("path");
const authorRouter = require('./routes/authorRouter');
const passport = require('./config/passportConfig');
const session = require('express-session');

const app = express();
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }  
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(express.static(path.join(__dirname, 'public')));
 

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