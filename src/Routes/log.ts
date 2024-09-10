import { Router } from "express";
import { Server } from "socket.io";
import { save, get, getINFO, getERROR, getWARNING, getCountByLevel, logsByMovie, frequentErrors, logsPerDay } from "../Controllers/logController";
import log from "../type/log";

const router = Router()

export default (io: Server) => {

  router.get('/', async (req, res) => {
    try {
      const logs = await get()
      io.emit('get logs', logs)
      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get logs' })
    }
  })

  router.get('/info', async (req, res) => {
    try {
      const logs = await getINFO()
      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get INFO logs' })
    }
  })

  router.get('/error', async (req, res) => {
    try {
      const logs = await getERROR()
      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get ERROR logs' })
    }
  })

  router.get('/warning', async (req, res) => {
    try {
      const logs = await getWARNING()
      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get WARNING logs' })
    }
  })

  router.get('/count-by-level', async (req, res) => {
    try {
      const logs = await getCountByLevel()
      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get logs count by level' })
    }
  })

  router.get('/movies', async (req, res) => {
    try {
      const logs = await logsByMovie()
      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get logs by movie' })
    }
  })

  router.get('/frequent-errors', async (req, res) => {
    try {
      const logs = await frequentErrors()
      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get frequent errors' })
    }
  })

  router.get('/logs-per-day', async (req, res) => {
    try {
      const logs = await logsPerDay()
      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: 'Failed to get logs per day' })
    }
  })

  router.post('/', async (req, res) => {
    try {
      const logs: log = req.body
      save(logs)
      io.emit('save logs', logs)
      res.status(200).json(logs)
    } catch (error) {
      res.status(500).json({ error: 'Failed to save log' })
    }
  })
  return router
}
