const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");
const { upgradeToAdmin,addCategoryQuery,getCategoriesQuery,addGameQuery } = require("../db/query"); 

const util = require('util');
const stream = require('stream');
const pipeline = util.promisify(stream.pipeline);

const uploadDir = path.join(__dirname, "../public/uploads");


const handleMembership = async (req, res) => {
  const { passwordd } = req.body;
  const userId = req.user.id;

  console.log("User ID:", userId);
  console.log("Entered password:", passwordd);

  try {
    const result = await upgradeToAdmin(userId, passwordd);
    if (result.success) {
      console.log("User upgraded to ADMIN:", result);
      res.redirect("/Home-admin");
    } else {
      console.log("Upgrade failed:", result);
      res.redirect("/memberShip");
    }
  } catch (err) {
    console.error("Error upgrading to admin:", err);
    res.redirect("/memberShip");
  }
};
const updateProfileImage = async (req, res) => {
    const userId = req.user.id;
    console.log("User ID:", userId);

    const uploadedFile = req.files?.profileImage;
    if (!uploadedFile) {
        return res.status(400).send("No image uploaded");
    }

    console.log("Uploaded file details:", uploadedFile);

    const imagePath = `${Date.now()}_${uploadedFile.name}`; 
    const savePath = path.join(uploadDir, imagePath);

    console.log("Saving image to:", savePath);

    await new Promise((resolve, reject) => {
        uploadedFile.mv(savePath, (err) => {
            if (err) {
                console.error("Error moving file", err);
                reject(err);
            } else {
                resolve();
            }
        });
    });

    const existingProfile = await prisma.profile.findFirst({
        where: { userId: userId },
    });

    console.log("Existing profile:", existingProfile);

    let updatedProfile;
    if (!existingProfile) {
        updatedProfile = await prisma.profile.create({
            data: {
                userId: userId,
                image: imagePath, 
            },
        });
    } else {
        updatedProfile = await prisma.profile.update({
            where: { userId: userId },
            data: { image: imagePath }, 
        });
    }

    console.log("Updated profile record:", updatedProfile);

    req.user.profile = req.user.profile || {}; 
    req.user.profile.image = imagePath; 

    req.session.save((err) => {
        if (err) {
            console.error("Error saving session:", err);
        }
        res.redirect("/manage-account");
    });
};

const addCategory = async (req, res) => {
  const { name } = req.body;

  try {
    const newCategory = await addCategoryQuery(name);
    console.log("New category added:", newCategory);
    res.redirect("/Home"); 
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(400).send(`Failed to add category: ${err.message}`); 
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await getCategoriesQuery();
    res.json(categories); 
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).send("Failed to fetch categories");
  }
};

const addGame = async (req, res) => {
  try {
   if (!req.files || !req.files.image) {
      return res.status(400).send("No image uploaded.");
    }

    const imageFile = req.files.image;
    const uploadPath = path.join(__dirname, "../public/uploads", imageFile.name);

    imageFile.mv(uploadPath, async (err) => {
      if (err) {
        console.error("Error saving file:", err);
        return res.status(500).send("Failed to save image.");
      }

      const gameData = {
        ...req.body,
        image: imageFile.name,
      };

      console.log("Game Data before saving:", gameData); 

      await addGameQuery(gameData);

      if (req.user.role === "ADMIN") {
        res.redirect("/Home-admin");
      } else {
        res.redirect("/Home");
      }
    });
  } catch (err) {
    console.error("Error adding game:", err);
    res.status(500).send("Failed to add game");
  }
};
const getGames = async (req, res) => {
  try {
    const games = await getGamesQuery();
    res.json(games);
  } catch (err) {
    console.error("Error fetching games:", err);
    res.status(500).send("Failed to fetch games");
  }
};

async function deleteMsgs(req, res) {
    const gameId =  parseInt (req.params.id);
    await prisma.games .delete({
      where:{id:gameId},
    });
     console.log(`Game with ID ${gameId} deleted.`);    
     res.redirect("/Home-admin");
}



module.exports = {
  handleMembership,
  updateProfileImage,
  addCategory,
  getCategories,
  addGame,
  getGames,
  deleteMsgs,
};