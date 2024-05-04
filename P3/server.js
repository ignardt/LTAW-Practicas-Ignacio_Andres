const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static('.'));

// Manejo de nuevas conexiones de socket
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    // Enviar mensaje de bienvenida al nuevo usuario
    socket.emit('message', 'Bienvenido al Chat!');

    // Notificar a otros usuarios sobre una nueva conexión
    socket.broadcast.emit('message', 'Se ha conectado un nuevo usuario');

    // Escuchar mensajes entrantes y retransmitirlos a todos los usuarios
    socket.on('sendMessage', (message) => {
        io.emit('message', message);
    });

    // Manejar desconexión de usuarios
    socket.on('disconnect', () => {
        io.emit('message', 'Un usuario ha dejado el chat');
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 9090;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


