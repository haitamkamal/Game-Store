const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");
const { upgradeToAdmin } = require("../db/query"); 

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

module.exports = {
  handleMembership,
  updateProfileImage
};