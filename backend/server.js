// Prisma client ek hi baar banta hai aur reuse hota hai (connection pool waste nahi hota)
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = { prisma };
