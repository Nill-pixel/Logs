import { HadoopConfig } from '../config/hadoopConfig';
import { log } from '../type/log';

export const saveToHDFS = async (logs: log) => {
  const date = new Date().toISOString().split('T')[0];
  // Modificando a estrutura do diretório para incluir o ano/mês
  const [year, month] = date.split('-');
  const baseDir = '/logss';
  const yearDir = `${baseDir}/${year}`;
  const monthDir = `${yearDir}/${month}`;
  const fileName = `${date}-logs.json`;
  const filePath = `${monthDir}/${fileName}`;

  console.log('Iniciando saveToHDFS...');
  console.log('Base Directory:', baseDir);
  console.log('File Path:', filePath);

  const client = HadoopConfig.getInstance();

  if (!client) {
    console.error('Cliente HDFS não inicializado');
    throw new Error('Cliente HDFS não inicializado');
  }

  try {
    // Função auxiliar para criar diretório
    const createDirectory = async (path: string) => {
      return new Promise<void>((resolve, reject) => {
        client.mkdir(path, (err: any) => {
          if (err) {
            // Ignora erro de diretório já existente
            if (err.message?.includes('already exists')) {
              console.log(`Diretório ${path} já existe, continuando...`);
              resolve();
            } else {
              console.error(`Erro ao criar diretório ${path}:`, err);
              reject(new Error(`Falha ao criar diretório ${path}: ${err.message || 'Erro desconhecido'}`));
            }
          } else {
            console.log(`Diretório ${path} criado com sucesso`);
            resolve();
          }
        });
      });
    };

    // Cria a hierarquia de diretórios
    await createDirectory(baseDir);
    await createDirectory(yearDir);
    await createDirectory(monthDir);

    // Remove o arquivo se ele já existir (para evitar conflitos)
    await new Promise<void>((resolve, reject) => {
      client.unlink(filePath, (err: any) => {
        if (err && !err.message?.includes('does not exist')) {
          console.error('Erro ao tentar remover arquivo existente:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Escreve o novo arquivo
    console.log('Iniciando escrita do arquivo:', filePath);

    return new Promise<string>((resolve, reject) => {
      const buffer = Buffer.from(JSON.stringify(logs, null, 2));

      client.writeFile(filePath, buffer, { overwrite: true }, (error: any) => {
        if (error) {
          console.error('Erro ao escrever arquivo:', error);
          reject(new Error(`Erro ao escrever arquivo: ${error.message || 'Erro desconhecido'}`));
        } else {
          console.log('Arquivo escrito com sucesso');
          resolve(`Logs salvos com sucesso em: ${filePath}`);
        }
      });
    });

  } catch (error) {
    console.error('Erro em saveToHDFS:', error);
    throw error;
  }
};