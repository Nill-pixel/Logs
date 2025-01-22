import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let mongoAvailable = true;

export const checkMongoAvailability = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    mongoAvailable = true;
  } catch (error) {
    console.warn("MongoDB indisponível:", error);
    mongoAvailable = false;
  }
  return mongoAvailable;
};
