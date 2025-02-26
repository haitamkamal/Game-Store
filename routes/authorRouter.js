const { Router } = require('express');
const passport = require('passport');
const authorRouter = Router();
const { registerUser } = require('../db/query');
const { handleMembership } = require('../controller/authorController');

authorRouter.get("/", (req, res) => {
  res.render("index");
});

authorRouter.get("/log-in",(req,res)=>{
  res.render("logIn")
})
authorRouter.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/Home",
    failureRedirect: "/",
    failureFlash: true 
  })
);
authorRouter.get("/sign-up", (req, res) => {
  res.render("SignUp");
});

authorRouter.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Received sign-up data:", { name, email, password });
  try {
    await registerUser(name, email, password);
    res.redirect("/");
  } catch (err) {
    console.error("Error during registration:", err);
    res.redirect("/sign-up");
  }
});

authorRouter.get("/Home",(req,res)=>{
  res.render("Home")
})
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); 
  }
  res.redirect("/log-in");
};


authorRouter.get("/memberShip", isAuthenticated, (req, res) => {
  res.render("memberShip");
});

authorRouter.post("/memberShip", isAuthenticated,  handleMembership)


authorRouter.get("/current-user", (req, res) => {
  res.json(req.user || "No user logged in");
});
module.exports = authorRouter;