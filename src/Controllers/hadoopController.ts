// src/Controllers/hadoopController.ts
import { Request, Response } from 'express';
import { HadoopConfig } from '../config/hadoopConfig';

export class HadoopController {
  public static async testConnection(req: Request, res: Response) {
    try {
      const isConnected = await HadoopConfig.testConnection();

      if (isConnected) {
        res.status(200).json({
          status: 'success',
          message: 'Conexão com Hadoop estabelecida com sucesso',
          connected: true
        });
      } else {
        res.status(500).json({
          status: 'error',
          message: 'Falha ao conectar com Hadoop',
          connected: false
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Erro ao testar conexão com Hadoop',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  public static getStatus(req: Request, res: Response) {
    const status = HadoopConfig.getConnectionStatus();
    res.status(200).json({
      status: status ? 'connected' : 'disconnected'
    });
  }
}