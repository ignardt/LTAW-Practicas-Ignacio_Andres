const socket = io();

// Escuchar mensajes del servidor
socket.on('message', function(message) {
    const messages = document.getElementById('messages');
    const item = document.createElement('li');
    if (typeof message === 'object') {
        if (message.fromServer) {
            item.textContent = message.text;
            item.classList.add('server-message'); 
        } else {
            item.textContent = message.text;
            
        }
    }
    messages.appendChild(item);
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
