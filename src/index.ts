import express from "express";
import router from "./Routes/log";
import { Server } from "socket.io";
import http from 'http'
import path from "path";
import cron from 'node-cron'
import { jsonParser, requestLogger, staticFiles } from "./Middleware/logMiddleware";
import { HadoopConfig } from "./config/hadoopConfig";
import hadoopRoutes from './Routes/hadoop';
import { syncSystems } from "./core/logStorageManager";


const app = express()
const server = http.createServer(app)
const io = new Server(server)
const publicPath = path.resolve(__dirname, '..', 'public');

app.use(jsonParser)
app.use(staticFiles)
app.use(requestLogger)

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.use('/logs', router(io))
// */5 * * * * *
// 0 */6 * * *
cron.schedule('*/5 * * * * *', async () => {
  try {
    await syncSystems();
    console.log('Sincronização completada com sucesso');
  } catch (error) {
    console.error('Erro durante a sincronização:', error);
  }
});

app.use('/hadoop', hadoopRoutes());

// Inicializa a conexão com Hadoop ao iniciar a aplicação
HadoopConfig.testConnection()
  .then(connected => {
    if (connected) {
      console.log('✅ Conexão com Hadoop estabelecida com sucesso');
    } else {
      console.log('❌ Falha ao conectar com Hadoop');
    }
  })
  .catch(error => {
    console.error('❌ Erro ao conectar com Hadoop:', error);
  });

io.on('connection', (socket) => {
  console.log('A user connected')

  socket.emit('message', 'Welcome to the WebSocket server!')

  socket.on('client-event', (data) => {
    console.log('Received event from client:', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnect')
  })
})

const PORT = process.env.PORT || 8000

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})