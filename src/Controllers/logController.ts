import { save_service } from "../Services/logService"
import log from "../type/log"
export const save = (logs: log) => {
  save_service(logs)
}