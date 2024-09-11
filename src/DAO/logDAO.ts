import { PrismaClient } from "@prisma/client";
import { log, LogsByDay, LogStats } from "../type/log";

const prisma = new PrismaClient()
export const save = async (logs: log) => {
  return await prisma.log.create({
    data: {
      level: logs.level,
      message: logs.message,
      details: logs.details
    }
  })
}

export const get = async () => {
  return await prisma.log.findMany()
}
export const count = async () => {
  return await prisma.log.count()
}


export const getINFO = async () => {
  return await prisma.log.findMany({
    where: {
      level: 'INFO'
    }
  })
}

export const getERROR = async () => {
  return await prisma.log.findMany({
    where: {
      level: 'ERROR'
    }
  })
}

export const getWARNING = async () => {
  return await prisma.log.findMany({
    where: {
      level: 'WARNING'
    }
  })
}

export const countINFO = async () => {
  return await prisma.log.count({
    where: {
      level: 'INFO'
    }
  })
}

export const countERROR = async () => {
  return await prisma.log.count({
    where: {
      level: 'ERROR'
    }
  })
}

export const countWARNING = async () => {
  return await prisma.log.count({
    where: {
      level: 'WARNING'
    }
  })
}


export const getCountByLevel = async () => {
  return await prisma.log.groupBy({
    by: ['level'],
    _count: {
      _all: true
    }
  })
}

export const frequentErrors = async () => {
  const errorCounts = await prisma.log.groupBy({
    by: ['message'],
    where: {
      level: 'ERROR',
    },
    _count: {
      message: true,  // Conta o número de ocorrências de cada mensagem de erro
    },
  });

  // Filtramos resultados onde message não é null
  const filteredErrors = errorCounts.filter(error => error.message !== null);

  // Ordenamos os resultados pela contagem e pelo nome da mensagem
  const sortedErrors = filteredErrors
    .sort((a, b) => {
      // Ordena pela contagem (decrescente)
      if (b._count.message !== a._count.message) {
        return b._count.message - a._count.message;
      }
      // Ordena por mensagem (alfabética), considerando que message não é null
      return (a.message as string).localeCompare(b.message as string);
    });

  // Retornamos apenas o erro mais frequente
  return sortedErrors[0]?.message || null;
}

// export const logsPerDay = async (): Promise<LogsByDay> => {
//   const logs = await prisma.log.groupBy({
//     by: ['data'],
//     _count: {
//       _all: true
//     },
//     orderBy: {
//       data: 'asc'
//     }
//   });

//   // Mapeia os resultados para agrupar por dia
//   const logsByDay: LogsByDay = logs.reduce((acc: LogsByDay, log) => {
//     // Extrai apenas a data (YYYY-MM-DD) e ignora a hora
//     const day = new Date(log.data).toISOString().split('T')[0];

//     // Se o dia já existir no acumulador, incrementa o contador
//     if (acc[day]) {
//       acc[day] += log._count._all;
//     } else {
//       acc[day] = log._count._all;
//     }

//     return acc;
//   }, {});

//   return logsByDay;
// };
export const logsPerDay = async (): Promise<LogStats> => {
  const logs = await prisma.log.groupBy({
    by: ['data'],
    _count: {
      _all: true
    },
    orderBy: {
      data: 'asc'
    }
  });

  // Mapeia os resultados para agrupar por dia
  const logsByDay: LogsByDay = logs.reduce((acc: LogsByDay, log) => {
    // Extrai apenas a data (YYYY-MM-DD) e ignora a hora
    const day = new Date(log.data).toISOString().split('T')[0]

    // Se o dia já existir no acumulador, incrementa o contador
    if (acc[day]) {
      acc[day] += log._count._all
    } else {
      acc[day] = log._count._all
    }

    return acc
  }, {})

  // Calcula o número total de logs e o número de dias únicos
  const totalLogs = Object.values(logsByDay).reduce((sum, count) => sum + count, 0)
  const totalDays = Object.keys(logsByDay).length

  // Calcula a média de logs por dia
  const averageLogsPerDay = totalDays > 0 ? Math.floor(totalLogs / totalDays) : 0

  // Retorna as estatísticas de logs
  return {
    totalLogs,
    totalDays,
    averageLogsPerDay
  }
}
export const logsByMovie = async () => {
  return await prisma.log.groupBy({
    by: ['message', 'details'],
    where: {
      message: {
        contains: 'movie'
      }
    },
    _count: {
      _all: true
    },
    orderBy: {
      _count: {
        message: 'desc'
      }
    }
  })
}

export const logsIncreasePercentage = async () => {
  const today = new Date();
  const lastFiveDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse(); // Reverte para ter ordem dos últimos 5 dias.

  const previousFiveDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - 10 - i);
    return date.toISOString().split('T')[0];
  }).reverse(); // Reverte para ter ordem dos 5 dias anteriores.

  // Obtemos a contagem total de logs para os últimos 5 dias
  const recentLogCount = await prisma.log.count({
    where: {
      data: {
        gte: new Date(`${lastFiveDays[0]}T00:00:00Z`),
        lt: new Date(`${lastFiveDays[4]}T23:59:59Z`)
      }
    }
  });

  // Obtemos a contagem total de logs para os 5 dias anteriores
  const previousLogCount = await prisma.log.count({
    where: {
      data: {
        gte: new Date(`${previousFiveDays[0]}T00:00:00Z`),
        lt: new Date(`${previousFiveDays[4]}T23:59:59Z`)
      }
    }
  });

  // Calcula a porcentagem de aumento
  const increase = recentLogCount - previousLogCount;
  const percentage = previousLogCount === 0 ? (recentLogCount === 0 ? 0 : 100) : (increase / previousLogCount) * 100;

  return percentage;
};


export const errorIncreasePercentage = async () => {
  const today = new Date();
  const lastFiveDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse(); // Reverte para ter ordem dos últimos 5 dias.

  const previousFiveDays = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - 10 - i);
    return date.toISOString().split('T')[0];
  }).reverse(); // Reverte para ter ordem dos 5 dias anteriores.

  // Obtemos a contagem de erros para os últimos 5 dias
  const recentErrorCount = await prisma.log.count({
    where: {
      level: 'ERROR',
      data: {
        gte: new Date(`${lastFiveDays[0]}T00:00:00Z`),
        lt: new Date(`${lastFiveDays[4]}T23:59:59Z`)
      }
    }
  });

  // Obtemos a contagem de erros para os 5 dias anteriores
  const previousErrorCount = await prisma.log.count({
    where: {
      level: 'ERROR',
      data: {
        gte: new Date(`${previousFiveDays[0]}T00:00:00Z`),
        lt: new Date(`${previousFiveDays[4]}T23:59:59Z`)
      }
    }
  });

  // Calcula a porcentagem de aumento
  const increase = recentErrorCount - previousErrorCount;
  const percentage = previousErrorCount === 0 ? (recentErrorCount === 0 ? 0 : 100) : (increase / previousErrorCount) * 100;

  return percentage;
};

