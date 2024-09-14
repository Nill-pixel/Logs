import path from "path"
import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
const publicPath = path.resolve(__dirname, '..', 'public')

export const jsonParser = bodyParser.json()
export const staticFiles = express.static(publicPath)

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`)
  next()
}