import { PrismaClient } from "@prisma/client";
import log from "../type/log";

const prisma = new PrismaClient()
export const save = async (logs: log) => {
  return await prisma.log.create({
    data: {
      level: logs.level,
      message: logs.message,
      details: logs.details
    }
  })
}

export const get = async () => {
  return await prisma.log.findMany()
}


export const getINFO = async () => {
  return await prisma.log.findMany({
    where: {
      level: 'INFO'
    }
  })
}

export const getERROR = async () => {
  return await prisma.log.findMany({
    where: {
      level: 'ERROR'
    }
  })
}

export const getWARNING = async () => {
  return await prisma.log.findMany({
    where: {
      level: 'WARNING'
    }
  })
}

export const getCountByLevel = async () => {
  return await prisma.log.groupBy({
    by: ['level'],
    _count: {
      _all: true
    }
  })
}

export const frequentErrors = async () => {
  return await prisma.log.groupBy({
    by: ['message'],
    where: {
      level: 'ERROR',
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        level: 'desc',
      },
    }
  })
}

export const logsPerDay = async () => {
  return await prisma.log.groupBy({
    by: ['data'],
    _count: {
      _all: true
    },
    orderBy: {
      data: 'asc'
    }
  })
}

export const logsByMovie = async () => {
  return await prisma.log.groupBy({
    by: ['message', 'details'],
    where: {
      message: {
        contains: 'movie'
      }
    },
    _count: {
      _all: true
    },
    orderBy: {
      _count: {
        message: 'desc'
      }
    }
  })
}