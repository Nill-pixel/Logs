import { LogLevel } from "@prisma/client"

export interface log {
  id: string
  logId: string 
  level: LogLevel
  message: string
  details: string
  data: string | Date
}
export interface LogsByDay {
  [key: string]: number;
}
export interface LogStats {
  totalLogs: number;
  totalDays: number;
  averageLogsPerDay: number;
}

export interface HadoopLog extends log {
  id: string;
  data: string | Date;
}