// src/core/logStorage.ts
import { PrismaClient } from "@prisma/client";
import { log } from "../type/log";
import { HadoopConfig } from '../config/hadoopConfig';

const prisma = new PrismaClient();
const hadoopClient = HadoopConfig.getInstance();

// Função para salvar no MongoDB
export const saveToMongoDB = async (log: log) => {
  return await prisma.log.create({
    data: {
      logId: log.logId,
      level: log.level,
      message: log.message,
      details: normalizeDetails(log.details),
      data: log.data
    }
  });
}

// Função para ler logs do Hadoop
export const readAllLogsFromHadoop = async (): Promise<log[]> => {
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
        resolve(JSON.parse(data));
      } catch (error) {
        resolve([]);
      }
    });

    readStream.on('error', () => {
      resolve([]);
    });
  });
}

// Função para salvar no Hadoop
export const saveToHadoop = async (log: log): Promise<string> => {
  const filePath = '/logs/logs.json';

  if (!hadoopClient) {
    throw new Error('Cliente HDFS não inicializado');
  }

  try {
    await ensureHadoopFile();

    // Lê logs existentes
    const existingLogs = await readAllLogsFromHadoop();
    const logWithId = {
      ...log,
      data: log.data
    };

    existingLogs.push(logWithId);

    // Salva o arquivo atualizado
    return new Promise((resolve, reject) => {
      const buffer = Buffer.from(JSON.stringify(existingLogs, null, 2));
      hadoopClient.writeFile(filePath, buffer, { overwrite: true }, (error: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(`Log salvo com sucesso em: ${filePath}`);
        }
      });
    });
  } catch (error) {
    console.error('Erro em saveToHadoop:', error);
    throw error;
  }
};


// Função para sincronizar sistemas
const normalizeDetails = (details: any): string => {
  if (typeof details === 'string') {
    try {
      // Se já for uma string JSON válida, retorna ela mesma
      JSON.parse(details);
      return details;
    } catch {
      // Se não for JSON válido, converte para string
      return JSON.stringify(details);
    }
  }
  // Se for objeto, converte para string
  return JSON.stringify(details);
};

// Função para verificar se o arquivo existe no Hadoop
const ensureHadoopFile = async (): Promise<void> => {
  const filePath = '/logs/logs.json';

  if (!hadoopClient) {
    throw new Error('Cliente HDFS não inicializado');
  }

  return new Promise((resolve, reject) => {
    // Primeiro verifica se o diretório existe
    hadoopClient.mkdir('/logs', async (dirErr: any) => {
      // Ignora erro se diretório já existe
      if (dirErr && !dirErr.message?.includes('already exists')) {
        reject(dirErr);
        return;
      }

      // Verifica se o arquivo existe
      hadoopClient.exists(filePath, async (exists: boolean) => {
        if (!exists) {
          // Se não existe, cria um arquivo vazio com array
          const buffer = Buffer.from(JSON.stringify([]));
          hadoopClient.writeFile(filePath, buffer, { overwrite: true }, (error: any) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });
  });
};

// Função para sincronizar sistemas atualizada
// Função para sincronizar sistemas atualizada
export const syncSystems = async (): Promise<void> => {
  try {
    // Garante que o arquivo existe no Hadoop antes de começar
    await ensureHadoopFile();

    const mongoLogs = await prisma.log.findMany();
    const hadoopLogs = await readAllLogsFromHadoop();

    // Sync MongoDB -> Hadoop
    for (const mongoLog of mongoLogs) {
      const normalizedMongoDetails = normalizeDetails(mongoLog.details);

      const existsInHadoop = hadoopLogs.some(hLog =>
        hLog.logId === mongoLog.logId
      );

      if (!existsInHadoop) {
        const sanitizedLog = {
          id: mongoLog.id,
          logId: mongoLog.logId,
          level: mongoLog.level,
          message: mongoLog.message,
          details: normalizedMongoDetails,
          data: mongoLog.data.toISOString()
        };
        await saveToHadoop(sanitizedLog);
      }
    }

    // Sync Hadoop -> MongoDB
    for (const hadoopLog of hadoopLogs) {
      const normalizedHadoopDetails = normalizeDetails(hadoopLog.details);

      const existsInMongo = mongoLogs.some(mLog =>
        mLog.logId === hadoopLog.logId
      );

      if (!existsInMongo) {
        const parsedLog = {
          ...hadoopLog,
          details: normalizedHadoopDetails,
          data: new Date(hadoopLog.data) // Converte string ISO para Date
        };
        await saveToMongoDB(parsedLog);
      }
    }
  } catch (error) {
    console.error('Erro na sincronização:', error);
    throw error;
  }
};


// src/Services/logService.ts
export const saveLog = async (log: log): Promise<void> => {
  const logWithId = {
    ...log,
    logId: log.logId
  };

  try {
    await saveToMongoDB(logWithId);
  } catch (mongoError) {
    console.error('Erro ao salvar no MongoDB, tentando Hadoop:', mongoError);
    try {
      await saveToHadoop(logWithId);
    } catch (hadoopError) {
      throw new Error('Falha ao salvar log em ambos os sistemas');
    }
  }
}