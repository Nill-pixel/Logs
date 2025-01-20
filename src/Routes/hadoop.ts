// src/routes/hadoopRoutes.ts
import { Router } from 'express';
import { HadoopController } from '../Controllers/hadoopController';

const router = Router();

export default () => {
  // Rota para testar conexão
  router.get('/test-connection', HadoopController.testConnection);

  // Rota para verificar status
  router.get('/status', HadoopController.getStatus);

  return router;
};