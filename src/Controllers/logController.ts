import {
  save as saveService,
  get as getService,
  getINFO as getINFOService,
  getERROR as getERRORService,
  getWARNING as getWARNINGService,
  getCountByLevel as getCountByLevelService,
  logsByMovie as logsByMovieService,
  logsPerDay as logsPerDayService,
  frequentErrors as frequentErrorsService
} from "../Services/logService"

import log from "../type/log"

export const save = async (logs: log) => {
  return await saveService(logs)
}


export const get = async () => {
  return await getService()
}

export const getINFO = async () => {
  return await getINFOService()
}

export const getERROR = async () => {
  return await getERRORService()
}

export const getWARNING = async () => {
  return await getWARNINGService()
}

export const getCountByLevel = async () => {
  return await getCountByLevelService()
}

export const logsPerDay = async () => {
  return await logsPerDayService()
}

export const logsByMovie = async () => {
  return await logsByMovieService()
}

export const frequentErrors = async () => {
  return await frequentErrorsService()
}
