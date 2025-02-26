const { upgradeToAdmin } = require("../db/query");

const handleMembership = async (req, res) => {
  const { passwordd } = req.body;
  const userId = req.user.id;

  console.log("User ID:", userId);
  console.log("Entered password:", passwordd);

  try {
    const result = await upgradeToAdmin(userId, passwordd);
    if (result.success) {
      console.log("User upgraded to ADMIN:", result);
      res.redirect("/home");
    } else {
      console.log("Upgrade failed:", result);
      res.redirect("/memberShip");
    }
  } catch (err) {
    console.error("Error upgrading to admin:", err);
    res.redirect("/memberShip");
  }
};

module.exports = {
  handleMembership,
};