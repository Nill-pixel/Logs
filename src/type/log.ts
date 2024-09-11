import { LogLevel } from "@prisma/client"

export interface log {
  level: LogLevel
  message: string
  details: string
}
export interface LogsByDay {
  [key: string]: number;
}
export interface LogStats {
  totalLogs: number;
  totalDays: number;
  averageLogsPerDay: number;
}
