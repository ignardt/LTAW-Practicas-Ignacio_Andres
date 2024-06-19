const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const port = 9090;

const users = require('./tienda.json').Usuarios;

http.createServer((req, res) => {
    console.log(`Request for ${req.url}`);

    // Función para obtener cookies del encabezado de la solicitud
    function getCookies(req) {
        let cookies = {};
        req.headers.cookie && req.headers.cookie.split(';').forEach(function(cookie) {
            let parts = cookie.match(/(.*?)=(.*)$/);
            cookies[parts[1].trim()] = (parts[2] || '').trim();
        });
        return cookies;
    }

    let cookies = getCookies(req);
    let loggedInUser = cookies.loggedInUser ? JSON.parse(decodeURIComponent(cookies.loggedInUser)) : null;

    if (req.method === 'GET') {
        let filePath;

        switch (req.url) {
            case '/':
                filePath = path.join(__dirname, 'index.html');
                break;
            case '/login.html':
                filePath = path.join(__dirname, 'login.html');
                break;
            case '/logout':
                loggedInUser = null;
                res.setHeader('Set-Cookie', 'loggedInUser=; Max-Age=0');
                res.writeHead(302, { 'Location': '/' });
                res.end();
                return;
            case '/producto1':
                filePath = path.join(__dirname, 'Productos', 'Producto1', 'producto1.html');
                break;
            case '/producto2':
                filePath = path.join(__dirname, 'Productos', 'Producto2', 'producto2.html');
                break;
            case '/producto3':
                filePath = path.join(__dirname, 'Productos', 'Producto3', 'producto3.html');
                break;
            default:
                filePath = path.join(__dirname, req.url);
                break;
        }

        let extname = String(path.extname(filePath)).toLowerCase();
        let mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif'
        };

        let contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code == 'ENOENT') {
                    fs.readFile(path.join(__dirname, 'error.html'), (error, content) => {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                        console.log(`404 Not Found: ${req.url}`);
                    });
                } else {
                    res.writeHead(500);
                    res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
                    console.log(`500 Internal Server Error: ${error.code}`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                if (req.url === '/' && loggedInUser) {
                    content = content.toString().replace('<a href="/login.html" class="btn-login">Iniciar sesión / Registrarse</a>', `<h1>Bienvenido, ${loggedInUser.nombre_real}</h1><a href="/logout" class="btn-logout">Cerrar sesión</a>`);
                }
                res.end(content, 'utf-8');
                console.log(`200 OK: ${req.url}`);
            }
        });
    } else if (req.method === 'POST' && req.url === '/login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const postData = querystring.parse(body);
            const username = postData.username;

            const user = users.find(user => user.nombre === username);

            if (user) {
                res.setHeader('Set-Cookie', `loggedInUser=${encodeURIComponent(JSON.stringify(user))}; HttpOnly`);
                res.writeHead(302, { 'Location': '/' });
                res.end();
            } else {
                res.writeHead(401, { 'Content-Type': 'text/html' });
                res.end('<h1>Usuario no encontrado</h1><a href="/login.html">Inténtalo de nuevo</a>');
            }
        });
    }
}).listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
