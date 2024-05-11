const socket = io();
let mySocketId = null;

function enterChat() {
    const username = document.getElementById('username').value.trim();
    if (username) {
        socket.emit('joinChat', username);
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('chat-container').style.display = 'flex';
    } else {
        alert("Por favor, ingresa un nombre válido.");
    }
}


socket.on('connect', () => {
    mySocketId = socket.id;  // Almacena el ID del socket cuando el cliente se conecta
});

socket.on('message', function(message) {
    const messages = document.getElementById('messages');
    const item = document.createElement('li');
    if (message.from === mySocketId) {
        item.classList.add('mine');
    } else {
        item.classList.add('theirs');
    }
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

    // Reproducir sonido solo si el mensaje es de otro usuario
    if (message.id !== mySocketId) {
        const sound = document.getElementById('message-sound');
        sound.play().catch(error => console.error('Error playing sound:', error));
    }
});

socket.on('updateUserList', function(users) {
    const userList = document.getElementById('users');
    userList.innerHTML = '';  // Limpiar la lista actual
    users.forEach(user => {
        const userElement = document.createElement('li');
        userElement.textContent = user;
        userList.appendChild(userElement);
    });
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

