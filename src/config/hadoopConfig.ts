// @ts-ignore
import WebHDFS from 'webhdfs';

export class HadoopConfig {
  private static instance: WebHDFS.WebHDFSClient;
  private static isConnected: boolean = false;

  public static getInstance(): WebHDFS.WebHDFSClient {
    if (!this.instance) {
      console.log('Criando cliente WebHDFS...');
      this.instance = WebHDFS.createClient({
        user: process.env.HADOOP_USER || 'hdfs',
        host: process.env.HADOOP_HOST || 'localhost',
        port: parseInt(process.env.HADOOP_PORT || '9870'),
        path: '/webhdfs/v1'
      });
    }
    return this.instance;
  }

  public static async testConnection(): Promise<boolean> {
    try {
      const client = this.getInstance();

      // Tenta criar um diretório de teste
      await new Promise((resolve, reject) => {
        client.mkdir('/test-connection', (error: any) => {
          if (error) {
            reject(error);
          }
          resolve(true);
        });
      });

      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Erro na conexão com Hadoop:', error);
      this.isConnected = false;
      return false;
    }
  }

  public static getConnectionStatus(): boolean {
    return this.isConnected;
  }
}