import {
  save as saveDAO,
  get as getDAO,
  count as countDAO,
  getINFO as getINFODAO,
  getERROR as getERRORDAO,
  getWARNING as getWARNINGDAO,
  countINFO as countINFODAO,
  countERROR as countERRORDAO,
  countWARNING as countWARNINGDAO,
  getCountByLevel as getCountByLevelDAO,
  logsPerDay as logsPerDayDAO,
  logsByMovie as logsByMovieDAO,
  frequentErrors as frequentErrorsDAO,
  logsIncreasePercentage as logsIncreasePercentageDAO,
  errorIncreasePercentage as errorIncreasePercentageDAO
} from "../DAO/logDAO";
import { log } from "../type/log";

export const save = async (logs: log) => {
  return await saveDAO(logs)
}

export const get = async () => {
  return await getDAO()
}
export const count = async () => {
  return await countDAO()
}

export const getINFO = async () => {
  return await getINFODAO()
}

export const getERROR = async () => {
  return await getERRORDAO()
}

export const getWARNING = async () => {
  return await getWARNINGDAO()
}
export const countINFO = async () => {
  return await countINFODAO()
}

export const countERROR = async () => {
  return await countERRORDAO()
}

export const countWARNING = async () => {
  return await countWARNINGDAO()
}

export const getCountByLevel = async () => {
  return await getCountByLevelDAO()
}

export const logsPerDay = async () => {
  return await logsPerDayDAO()
}

export const logsByMovie = async () => {
  return await logsByMovieDAO()
}

export const frequentErrors = async () => {
  return await frequentErrorsDAO()
}
export const logsIncreasePercentage = async () => {
  return await logsIncreasePercentageDAO()
}

export const errorIncreasePercentage = async () => {
  return await errorIncreasePercentageDAO()
}