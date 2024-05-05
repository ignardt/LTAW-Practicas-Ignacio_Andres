const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const moment = require('moment'); // Asegúrate de que esta librería esté instalada.

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('.'));

let userCount = 0;  // Para mantener el conteo de los usuarios conectados

io.on('connection', (socket) => {
    userCount++;  // Incrementar cuando un usuario se conecta
    console.log('Nuevo usuario conectado');

    // Enviar mensaje de bienvenida como un mensaje del servidor
    socket.emit('message', { text: 'Bienvenido al Chat!', fromServer: true });

    // Notificar a otros usuarios sobre una nueva conexión como un mensaje del servidor
    socket.broadcast.emit('message', { text: 'Se ha conectado un nuevo usuario', fromServer: true });

    socket.on('sendMessage', (message) => {
        if (message.startsWith('/')) {
            handleCommand(message, socket);
        } else {
            io.emit('message', { text: message, fromServer: false, from: socket.id });
        }
    });

    // Manejar desconexión de usuarios
    socket.on('disconnect', () => {
        userCount--;  // Decrementar cuando un usuario se desconecta
        io.emit('message', { text: 'Un usuario ha dejado el chat', fromServer: true });
    });
});

function handleCommand(message, socket) {
    switch (message.trim()) {
        case '/help':
            socket.emit('message', { text: 'Comandos disponibles: /help, /list, /hello, /date', fromServer: true });
            break;
        case '/list':
            socket.emit('message', { text: `Número de usuarios conectados: ${userCount}`, fromServer: true });
            break;
        case '/hello':
            socket.emit('message', { text: 'Hola! ¿Cómo estás?', fromServer: true });
            break;
        case '/date':
            socket.emit('message', { text: `Fecha y hora actual: ${moment().format('LLLL')}`, fromServer: true });
            break;
        default:
            socket.emit('message', { text: 'Comando desconocido. Escribe /help para ver los comandos disponibles.', fromServer: true });
            break;
    }
}

const PORT = process.env.PORT || 9090;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
