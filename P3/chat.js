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
        item.textContent = message.text;
    } else if (message.fromServer) {
        item.classList.add('server-message');
        item.textContent = message.text;
    } else {
        item.classList.add('theirs');
        item.innerHTML = `<span class="username">${message.username}:</span> ${message.text}`;
    }

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight; 

    // Reproducir sonido solo si el mensaje es de otro usuario
    if (message.id !== mySocketId) {
        const sound = document.getElementById('message-sound');
        sound.play().catch(error => console.error('Error playing sound:', error));
    }
});

socket.on('updateUserList', function(users) {
    const userList = document.getElementById('users');
    userList.innerHTML = '';  // Limpiar la lista actual
    const currentUser = document.getElementById('username').value;

    users.forEach(user => {
        const userElement = document.createElement('li');
        userElement.textContent = user;
        // Añadir clase específica si es el usuario actual
        if (user === currentUser) {
            userElement.classList.add('my-username');
        }
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

