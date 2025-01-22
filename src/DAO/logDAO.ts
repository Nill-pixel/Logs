import { LogLevel, PrismaClient } from "@prisma/client";
import { log, LogsByDay, LogStats } from "../type/log";
import { HadoopConfig } from "../config/hadoopConfig";
import { JsonValue } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();
const hadoopClient = HadoopConfig.getInstance();

// Função utilitária para executar operações com failover
const executarComFailover = async <T>(
  operacaoMongo: () => Promise<T>,
  operacaoHadoop: () => Promise<T>,
  mensagemErro: string
): Promise<T> => {
  try {
    return await operacaoMongo();
  } catch (erroMongo) {
    console.error(`Erro no MongoDB: ${mensagemErro}`, erroMongo);
    try {
      return await operacaoHadoop();
    } catch (erroHadoop) {
      console.error(`Erro no Hadoop: ${mensagemErro}`, erroHadoop);
      throw new Error(`Falha em ambos os sistemas: ${mensagemErro}`);
    }
  }
};

// Operações MongoDB
export const saveToMongoDB = async (log: log) => {
  return await prisma.log.create({
    data: {
      logId: log.logId || crypto.randomUUID(),
      level: log.level,
      message: log.message,
      details: log.details,
      data: new Date()
    }
  });
};

// Operações Hadoop
// Primeiro, vamos ajustar a interface do log para o Hadoop

// Modificar a função readAllLogsFromHadoop para incluir id

export const readAllLogsFromHadoop = async (): Promise<{ data: Date; logId: string, id: string; level: LogLevel; message: string; details: JsonValue }[]> => {
  const filePath = '/logs/logs.json';

  if (!hadoopClient) {
    throw new Error('Cliente HDFS não inicializado');
  }

  return new Promise((resolve, reject) => {
    let data = '';
    const readStream = hadoopClient.createReadStream(filePath);

    readStream.on('data', (chunk: Buffer) => {
      data += chunk.toString();
    });

    readStream.on('end', () => {
      try {
        const logs = JSON.parse(data);
        const logsWithId = logs.map((log: any, index: number) => ({
          ...log,
          id: log.id || `hadoop-${index}`,
          data: new Date(log.data), // Converte string para Date
        }));

        resolve(logsWithId);
      } catch (error) {
        resolve([]);
      }
    });

    readStream.on('error', () => {
      resolve([]);
    });
  });
};

// Agora podemos ajustar a função get
export const get = async () => {
  return executarComFailover(
    async () => await prisma.log.findMany(),
    async () => {
      const logs = await readAllLogsFromHadoop();
      return logs.map(log => ({
        ...log,
        data: new Date(log.data) // Garante que data é sempre um objeto Date
      }));
    },
    'falha ao buscar logs'
  );
};

// Atualizar também a função de salvamento para incluir id
export const saveToHadoop = async (log: log): Promise<any> => {
  const filePath = '/logs/logs.json';

  if (!hadoopClient) {
    throw new Error('Cliente HDFS não inicializado');
  }

  try {
    await new Promise((resolve, reject) => {
      hadoopClient.mkdir('/logs', (err: any) => {
        if (err && !err.message?.includes('already exists')) {
          reject(err);
        }
        resolve(true);
      });
    });

    const existingLogs = await readAllLogsFromHadoop();
    const newLog = {
      ...log,
      logId: log.logId || crypto.randomUUID(),
      id: `hadoop-${existingLogs.length + 1}`,
      data: new Date()
    };
    existingLogs.push(newLog);

    return new Promise((resolve, reject) => {
      const buffer = Buffer.from(JSON.stringify(existingLogs, null, 2));
      hadoopClient.writeFile(filePath, buffer, { overwrite: true }, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            ...newLog,
            data: new Date(newLog.data)
          });
        }
      });
    });
  } catch (error) {
    console.error('Erro em saveToHadoop:', error);
    throw error;
  }
};

// Operações principais com failover
export const save = async (logs: log) => {
  return executarComFailover(
    async () => {
      return await saveToMongoDB(logs)
    },
    async () => await saveToHadoop(logs),
    'falha ao salvar log'
  );
};


export const count = async () => {
  return executarComFailover(
    async () => await prisma.log.count(),
    async () => {
      const logs = await readAllLogsFromHadoop();
      return logs.length;
    },
    'falha ao contar logs'
  );
};

// Operações filtradas com failover
export const getINFO = async () => {
  return executarComFailover(
    async () => await prisma.log.findMany({ where: { level: 'INFO' } }),
    async () => {
      const logs = await readAllLogsFromHadoop();
      return logs.filter(log => log.level === 'INFO');
    },
    'falha ao buscar logs INFO'
  );
};

export const getERROR = async () => {
  return executarComFailover(
    async () => await prisma.log.findMany({ where: { level: 'ERROR' } }),
    async () => {
      const logs = await readAllLogsFromHadoop();
      return logs.filter(log => log.level === 'ERROR');
    },
    'falha ao buscar logs ERROR'
  );
};

export const getWARNING = async () => {
  return executarComFailover(
    async () => await prisma.log.findMany({ where: { level: 'WARNING' } }),
    async () => {
      const logs = await readAllLogsFromHadoop();
      return logs.filter(log => log.level === 'WARNING');
    },
    'falha ao buscar logs WARNING'
  );
};

export const countINFO = async () => {
  return executarComFailover(
    async () => await prisma.log.count({ where: { level: 'INFO' } }),
    async () => {
      const logs = await readAllLogsFromHadoop();
      return logs.filter(log => log.level === 'INFO').length;
    },
    'falha ao contar logs INFO'
  );
};

export const countERROR = async () => {
  return executarComFailover(
    async () => await prisma.log.count({ where: { level: 'ERROR' } }),
    async () => {
      const logs = await readAllLogsFromHadoop();
      return logs.filter(log => log.level === 'ERROR').length;
    },
    'falha ao contar logs ERROR'
  );
};

export const countWARNING = async () => {
  return executarComFailover(
    async () => await prisma.log.count({ where: { level: 'WARNING' } }),
    async () => {
      const logs = await readAllLogsFromHadoop();
      return logs.filter(log => log.level === 'WARNING').length;
    },
    'falha ao contar logs WARNING'
  );
};

// Operações estatísticas com failover
export const getCountByLevel = async () => {
  return executarComFailover(
    async () => await prisma.log.groupBy({
      by: ['level'],
      _count: {
        _all: true
      }
    }),
    async () => {
      const logs = await readAllLogsFromHadoop();
      const counts = logs.reduce((acc: any, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(counts).map(([level, count]) => ({
        level,
        _count: { _all: count }
      }));
    },
    'falha ao agrupar logs por nível'
  );
};

export const frequentErrors = async () => {
  return executarComFailover(
    async () => {
      const errorCounts = await prisma.log.groupBy({
        by: ['message'],
        where: {
          level: 'ERROR',
        },
        _count: {
          message: true,
        },
      });
      const filteredErrors = errorCounts.filter(error => error.message !== null);
      const sortedErrors = filteredErrors.sort((a, b) => {
        if (b._count.message !== a._count.message) {
          return b._count.message - a._count.message;
        }
        return (a.message as string).localeCompare(b.message as string);
      });
      return sortedErrors[0]?.message || null;
    },
    async () => {
      const logs = await readAllLogsFromHadoop();
      const errorCounts = logs
        .filter(log => log.level === 'ERROR' && log.message)
        .reduce((acc: { [key: string]: number }, log) => {
          acc[log.message] = (acc[log.message] || 0) + 1;
          return acc;
        }, {});
      const sortedErrors = Object.entries(errorCounts)
        .sort(([msgA, countA], [msgB, countB]) => {
          if (countB !== countA) {
            return countB - countA;
          }
          return msgA.localeCompare(msgB);
        });
      return sortedErrors[0]?.[0] || null;
    },
    'falha ao buscar erros frequentes'
  );
};

export const logsPerDay = async (): Promise<LogStats> => {
  return executarComFailover(
    async () => {
      const logs = await prisma.log.groupBy({
        by: ['data'],
        _count: {
          _all: true
        },
        orderBy: {
          data: 'asc'
        }
      });

      const logsByDay = logs.reduce((acc: LogsByDay, log) => {
        const day = new Date(log.data).toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + log._count._all;
        return acc;
      }, {});

      const totalLogs = Object.values(logsByDay).reduce((sum, count) => sum + count, 0);
      const totalDays = Object.keys(logsByDay).length;
      const averageLogsPerDay = totalDays > 0 ? Math.floor(totalLogs / totalDays) : 0;

      return {
        totalLogs,
        totalDays,
        averageLogsPerDay
      };
    }, async () => {
      const logs = await readAllLogsFromHadoop();
      // Depuração para verificar os dados

      const logsByDay = logs.reduce((acc: LogsByDay, log) => {
        try {
          const date = new Date(log.data);
          if (!isNaN(date.getTime())) { // Ignora datas inválidas
            const day = date.toISOString().split('T')[0];
            acc[day] = (acc[day] || 0) + 1;
          } else {
            console.warn(`Data inválida ignorada: ${log.data}`);
          }
        } catch (error) {
          console.error(`Erro ao processar log: ${JSON.stringify(log)}`, error);
        }
        return acc;
      }, {} as LogsByDay);



      const totalLogs = Object.values(logsByDay).reduce((sum, count) => sum + count, 0);
      const totalDays = Object.keys(logsByDay).length;
      const averageLogsPerDay = totalDays > 0 ? Math.floor(totalLogs / totalDays) : 0;

      return {
        totalLogs,
        totalDays,
        averageLogsPerDay,
      };
    },
    'falha ao calcular estatísticas de logs por dia'
  );
};

// export const logsByMovie = async () => {
//   return executarComFailover(
//     async () => await prisma.log.groupBy({
//       by: ['message', 'details'],
//       where: {
//         message: {
//           contains: 'movie',
//         },
//       },
//       _count: {
//         _all: true,
//       },
//       orderBy: {
//         _count: {
//           _all: 'desc',
//         },
//       },
//     }),
//     async () => {
//       const logs = await readAllLogsFromHadoop();
//       const movieLogs = logs.filter(log => log.message?.toLowerCase().includes('movie'));

//       // Agrupando os logs
//       const grouped = movieLogs.reduce((acc: Record<string, number>, log) => {
//         const key = `${log.message}|${log.details}`;
//         acc[key] = (acc[key] || 0) + 1;
//         return acc;
//       }, {});

//       // Convertendo o agrupamento em um array formatado
//       return Object.entries(grouped).map(([key, count]) => {
//         const [message, details] = key.split('|');
//         return {
//           id: "", // Usando string vazia para compatibilidade
//           level: LogLevel.INFO, // Usando um valor válido do enum LogLevel
//           date: "", // Usando string vazia para compatibilidade
//           data: null, // Mantendo o valor null para data
//           message,
//           details,
//           _count: { _all: count as number },
//         };
//       });
//     },
//     'falha ao buscar logs de filmes'
//   );
// };





export const logsIncreasePercentage = async () => {
  return executarComFailover(
    async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(1); // Primeiro dia deste mês

      const todayLogs = await prisma.log.count({
        where: {
          data: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lte: new Date(today.setHours(23, 59, 59, 999))
          }
        }
      });

      const totalLogs = await prisma.log.count({
        where: {
          data: {
            gte: startDate,
            lte: today
          }
        }
      });

      return totalLogs === 0 ? 0 : Math.round((todayLogs / totalLogs) * 100); // Arredonda para inteiro
    },
    async () => {
      const logs = await readAllLogsFromHadoop();
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(1);

      const todayLogs = logs.filter(log => {
        const logDate = new Date(log.data);
        return logDate.toDateString() === today.toDateString();
      }).length;

      const totalLogs = logs.filter(log => {
        const logDate = new Date(log.data);
        return logDate >= startDate && logDate <= today;
      }).length;

      return totalLogs === 0 ? 0 : Math.round((todayLogs / totalLogs) * 100); // Arredonda para inteiro
    },
    'falha ao calcular percentual de logs'
  );
};


export const errorIncreasePercentage = async () => {
  return executarComFailover(
    async () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Início do mês

      // Conta os erros registrados desde o início do mês até hoje
      const monthlyErrorCount = await prisma.log.count({
        where: {
          level: 'ERROR',
          data: {
            gte: startOfMonth,
            lte: today
          }
        }
      });

      // Conta os erros registrados hoje
      const todayErrorCount = await prisma.log.count({
        where: {
          level: 'ERROR',
          data: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lte: new Date(today.setHours(23, 59, 59, 999))
          }
        }
      });

      // Calcula a porcentagem de logs de erro registrados hoje em relação ao total de erros do mês até hoje
      const percentage = monthlyErrorCount === 0 ? (todayErrorCount === 0 ? 0 : 100) : (todayErrorCount / monthlyErrorCount) * 100;
      return Math.round(percentage); // Arredonda para inteiro
    },
    async () => {
      const logs = await readAllLogsFromHadoop();
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Início do mês

      // Filtra os logs de erro desde o início do mês até hoje
      const monthlyErrors = logs.filter(log => {
        const logDate = new Date(log.data);
        return log.level === 'ERROR' && logDate >= startOfMonth && logDate <= today;
      });

      // Filtra os logs de erro de hoje
      const todayErrors = logs.filter(log => {
        const logDate = new Date(log.data);
        return log.level === 'ERROR' && logDate.toDateString() === today.toDateString();
      });

      // Calcula a porcentagem de logs de erro registrados hoje em relação ao total de erros do mês até hoje
      const percentage = monthlyErrors.length === 0 ? (todayErrors.length === 0 ? 0 : 100) : (todayErrors.length / monthlyErrors.length) * 100;
      return Math.round(percentage); // Arredonda para inteiro
    },
    'falha ao calcular percentual de aumento de erros'
  );
};


