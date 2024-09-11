import {
  save as saveService,
  get as getService,
  count as countService,
  getINFO as getINFOService,
  getERROR as getERRORService,
  getWARNING as getWARNINGService,
  countINFO as countINFOService,
  countERROR as countERRORService,
  countWARNING as countWARNINGService,
  getCountByLevel as getCountByLevelService,
  logsByMovie as logsByMovieService,
  logsPerDay as logsPerDayService,
  frequentErrors as frequentErrorsService,
  logsIncreasePercentage as logsIncreasePercentageService,
  errorIncreasePercentage as errorIncreasePercentageService
} from "../Services/logService"

import { log } from "../type/log"

export const save = async (logs: log) => {
  return await saveService(logs)
}


export const get = async () => {
  return await getService()
}
export const count = async () => {
  return await countService()
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
export const countINFO = async () => {
  return await countINFOService()
}

export const countERROR = async () => {
  return await countERRORService()
}

export const countWARNING = async () => {
  return await countWARNINGService()
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

export const logsIncreasePercentage = async () => {
  return await logsIncreasePercentageService()
}

export const errorIncreasePercentage = async () => {
  return await errorIncreasePercentageService()
}
