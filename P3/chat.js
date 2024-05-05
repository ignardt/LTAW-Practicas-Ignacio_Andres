const socket = io();

function enterChat() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        socket.emit('joinChat', username);
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('chat-container').style.display = 'block';
    } else {
        alert("Por favor, ingresa un nombre válido.");
    }
}

// Escuchar mensajes del servidor
socket.on('message', function(message) {
    const messages = document.getElementById('messages');
    const item = document.createElement('li');
    if (typeof message === 'object') {
        if (message.fromServer) {
            item.textContent = message.text;
            item.classList.add('server-message');
        } else {
            item.textContent = message.username + ": " + message.text;
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
        socket.emit('sendMessage', { text: input.value, username: document.getElementById('username').value });
        input.value = '';
    }
});

