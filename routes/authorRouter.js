const { Router } = require('express');
const passport = require('passport');
const authorRouter = Router();
const { registerUser,addGameQuery } = require('../db/query');
const { handleMembership,updateProfileImage, addCategory,getCategories,addGame  } = require('../controller/authorController');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const isAuthenticated = (req, res, next) => {

  console.log("Checking if user is authenticated:", req.isAuthenticated()); 
  console.log("Request user:", req.user); 
  if (req.isAuthenticated()) {
    return next(); 
  }
  res.redirect("/log-in");
};

// Home route
authorRouter.get("/", (req, res) => {
  res.render("index");
});

// Login route
authorRouter.get("/log-in", (req, res) => {
  res.render("logIn");
});

// Handle login form submission
authorRouter.post("/log-in", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err); 
    }
    if (!user) {
      req.flash("error", info.message); 
      return res.redirect("/");
    }

    // Log the user in
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      // Check the user's role and redirect accordingly
      if (user.role === "ADMIN") {
        return res.redirect("/Home-admin"); 
      } else {
        return res.redirect("/Home"); 
      }
    });
  })(req, res, next); 
});

// Sign-up route
authorRouter.get("/sign-up", (req, res) => {
  res.render("SignUp");
});

// Handle sign-up form submission
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

authorRouter.get("/log-out",(req,res,next)=>{
    req.logOut((err)=>{
      if(err){
        return next(err);
      }
      res.redirect("/");
    })
})

// Home route (for authenticated users)
authorRouter.get("/Home", isAuthenticated, async (req, res) => {
  if (req.user.role === "ADMIN") {
    return res.redirect("/Home-admin");
  }
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { profile: true },
  });
  const categories = await prisma.categories.findMany()
  const games = await prisma.games.findMany({
    include:{
      categories:true
    }
  })
  res.render("Home", { user,categories,games});
});

// Membership route (for authenticated users)
authorRouter.get("/memberShip", isAuthenticated, (req, res) => {
  res.render("memberShip");
});

// Handle membership form submission
authorRouter.post("/memberShip", isAuthenticated, handleMembership);

// Admin home route (for authenticated admins)
authorRouter.get("/Home-admin", isAuthenticated, async(req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.redirect("/Home"); 
  }
   const user = await prisma.user.findUnique({
      where: { id: req.user.id, },
      include: { profile: true }, 
    });
    const categories = await prisma.categories.findMany();
     const games = await prisma.games.findMany({
    include:{
      categories:true
    }
  })
      res.render("adminHome", { user, categories,games });
});

// Debugging route to check the current user
authorRouter.get("/current-user", (req, res) => {
  res.json(req.user || "No user logged in");
});

authorRouter.get("/manage-account", isAuthenticated, async (req, res) => {
    if (!req.user) {
        return res.status(401).send("Unauthorized");
    }
    
    const userId = req.user.id; 
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    res.render("manageAccount", { user });
});


authorRouter.post("/update-profile-image", isAuthenticated ,updateProfileImage);


authorRouter.post("/add-categories",isAuthenticated,addCategory);

authorRouter.get("/categories", isAuthenticated, getCategories);


authorRouter.post("/add-games", isAuthenticated, async (req, res) => {
  try {
    console.log("Received form data:", req.body);
    await addGame(req.body, req, res);
  } catch (err) {
    console.error("Error adding game:", err);
    res.status(500).send("Failed to add game");
  }
});



module.exports = authorRouter;