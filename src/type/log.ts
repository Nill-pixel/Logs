import { LogLevel } from "@prisma/client"

interface log {
  level: LogLevel
  message: string
  details: string
}
export default log