const socket = io();

// Escuchar mensajes del servidor
socket.on('message', function(message) {
    const item = document.createElement('li');
    item.textContent = message;
    document.getElementById('messages').appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

// Enviar mensajes al servidor
const form = document.getElementById('form');
const input = document.getElementById('input');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('sendMessage', input.value);
        input.value = '';
    }
});
