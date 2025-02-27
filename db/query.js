const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");


const prisma = new PrismaClient();

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const registerUser = async (name, email, password, uploadFileName = null) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "User already exists" };
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "USER",
      profile: {
        create: {
          image: uploadFileName || "default-profile.jpg", // Associate image with the profile
        },
      },
      Membership: {
        create: {
          passwordd: "admin123", // No image field here
        },
      },
    },
    include: {
      profile: true,
      Membership: true,
    },
  });

  console.log("New user created:", newUser);
  return { message: "User registered", user: newUser };
};

const getUserByEmail = async (email) =>{
  return await prisma.user.findUnique({where:{email}})
};
const getUserById = async (id) =>{
  return await prisma.user.findUnique({where:{id}})
};


const upgradeToAdmin = async (userId, passwordd) => {
  try {
    console.log("Checking membership for user ID:", userId);
    const membership = await prisma.membership.findFirst({
      where: { authorId: userId },
    });

    if (!membership) {
      console.log("Membership not found for user ID:", userId);
      return { success: false, message: "Membership not found" };
    }

    console.log("Membership found:", membership);

    if (passwordd === membership.passwordd) {
      console.log("Password matches. Upgrading user to ADMIN...");
      await prisma.user.update({
        where: { id: userId },
        data: { role: "ADMIN" },
      });
      return { success: true, message: "User upgraded to admin" };
    } else {
      console.log("Incorrect password entered.");
      return { success: false, message: "Incorrect password" };
    }
  } catch (err) {
    console.error("Error upgrading to admin:", err);
    throw err;
  }
};

const fixMissingMemberships = async () => {
  const users = await prisma.user.findMany({
    include: { Membership: true },
  });

  for (const user of users) {
    if (!user.Membership.length) {
      await prisma.membership.create({
        data: {
          passwordd: "admin123",
          authorId: user.id,
        },
      });
      console.log(`Created membership for user ID: ${user.id}`);
    }
  }
};
fixMissingMemberships()
  .catch((err) => console.error("Error fixing memberships:", err))
  .finally(() => prisma.$disconnect());


module.exports ={
  registerUser,
  getUserByEmail,
  getUserById,
  upgradeToAdmin
}