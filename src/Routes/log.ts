import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { Server } from "socket.io";
import { save } from "../Controllers/logController.server";
import log from "../type/log";

const router = Router()
const prisma = new PrismaClient()

export default (io: Server) => {

  router.get('/', async (req, res) => {
    const logs = await prisma.log.findMany()
    io.emit('get logs', logs)
    res.status(200).json(logs)
  })
  router.post('/', async (req, res) => {
    const logs: log = req.body
    save(logs)
    io.emit('get logs', logs)
    res.status(200).json(logs)
  })
  return router
}
