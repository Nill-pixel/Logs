import log from "../type/log";
import { save } from "../DAO/logDAO.server";

export const save_service = (logs: log) => {
  save(logs)
}