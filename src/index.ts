import express from "express";
import router from "./Routes/log";
import { Server } from "socket.io";
import http from 'http'
import path from "path";
import { jsonParser, requestLogger, staticFiles } from "./Middleware/logMiddleware";

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