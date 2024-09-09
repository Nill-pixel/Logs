import { PrismaClient } from "@prisma/client";
import log from "../type/log";

const prisma = new PrismaClient()
export const save = async (logs: log) => {
  await prisma.log.create({
    data: {
      level: logs.level,
      message: logs.message,
      details: logs.details
    }
  })
}