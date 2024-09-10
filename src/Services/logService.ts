import log from "../type/log";
import {
  save as saveDAO,
  get as getDAO,
  getINFO as getINFODAO,
  getERROR as getERRORDAO,
  getWARNING as getWARNINGDAO,
  getCountByLevel as getCountByLevelDAO,
  logsPerDay as logsPerDayDAO,
  logsByMovie as logsByMovieDAO,
  frequentErrors as frequentErrorsDAO
} from "../DAO/logDAO";

export const save = async (logs: log) => {
  return await saveDAO(logs)
}

export const get = async () => {
  return await getDAO()
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