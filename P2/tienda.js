const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const port = 9090;

const users = require('./tienda.json').Usuarios;
const productos = require('./tienda.json').Productos;
let pedidos = require('./tienda.json').Pedidos;

let carritos = {};

http.createServer((req, res) => {
    console.log(`Request for ${req.url}`);

    function getCookies(req) {
        let cookies = {};
        req.headers.cookie && req.headers.cookie.split(';').forEach(function(cookie) {
            let parts = cookie.match(/(.*?)=(.*)$/);
            if (parts) {
                cookies[parts[1].trim()] = (parts[2] || '').trim();
            }
        });
        return cookies;
    }

    let cookies = getCookies(req);
    let loggedInUser = cookies.loggedInUser ? JSON.parse(decodeURIComponent(cookies.loggedInUser)) : null;

    if (req.method === 'GET') {
        let filePath;

        switch (true) {
            case (req.url === '/' || req.url === '/index.html'):
                filePath = path.join(__dirname, 'index.html');
                break;
            case req.url === '/login.html':
                filePath = path.join(__dirname, 'login.html');
                break;
            case req.url === '/carrito.html':
                if (loggedInUser) {
                    filePath = path.join(__dirname, 'carrito.html');
                } else {
                    res.writeHead(302, { 'Location': '/login.html' });
                    res.end();
                    return;
                }
                break;
            case req.url === '/checkout.html':
                if (loggedInUser) {
                    filePath = path.join(__dirname, 'checkout.html');
                } else {
                    res.writeHead(302, { 'Location': '/login.html' });
                    res.end();
                    return;
                }
                break;
            case req.url.startsWith('/search'):
                const query = new URLSearchParams(req.url.split('?')[1]).get('query').toLowerCase();
                const matches = productos.filter(producto => producto.nombre.toLowerCase().includes(query));
                if (req.headers.accept && req.headers.accept.includes('application/json')) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(matches));
                } else if (matches.length > 0) {
                    const matchedProduct = matches[0];
                    res.writeHead(302, { 'Location': matchedProduct.ruta });
                    res.end();
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>Producto no encontrado</h1><a href="/">Volver a la tienda</a>');
                }
                return;
            case req.url === '/logout':
                loggedInUser = null;
                res.setHeader('Set-Cookie', 'loggedInUser=; Max-Age=0; HttpOnly; Path=/');
                res.writeHead(302, { 'Location': '/' });
                res.end();
                return;
            case req.url === '/producto1':
                filePath = path.join(__dirname, 'Productos', 'Producto1', 'producto1.html');
                break;
            case req.url === '/producto2':
                filePath = path.join(__dirname, 'Productos', 'Producto2', 'producto2.html');
                break;
            case req.url === '/producto3':
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
                if ((req.url === '/' || req.url === '/index.html') && loggedInUser) {
                    let modifiedContent = content.toString()
                        .replace('<a href="/login.html" class="btn-login">Iniciar sesión / Registrarse</a>', `<h1>Bienvenido, ${loggedInUser.nombre_real}</h1><a href="/logout" class="btn-logout">Cerrar sesión</a>`)
                        .replace('<a href="/login.html"><img src="Fuentes/carrito.webp" style="height: 75px;" alt="Carrito" class="cart-button"></a>', `<a href="/carrito.html"><img src="Fuentes/carrito.webp" style="height: 75px;" alt="Carrito" class="cart-button"></a>`);
                    res.end(modifiedContent, 'utf-8');
                } else if (req.url === '/carrito.html' && loggedInUser) {
                    console.log(`Generando contenido del carrito para ${loggedInUser.nombre}`);
                    let carrito = carritos[loggedInUser.nombre] || [];
                    let carritoHtml = carrito.map(producto => `<li>${producto}</li>`).join('');
                    console.log('Carrito HTML generado:', carritoHtml); // Verificar el HTML generado
                    let modifiedContent = content.toString().replace('<ul id="cart-items">', `<ul id="cart-items">${carritoHtml}`);
                    console.log('Contenido del carrito modificado:', modifiedContent); // Verificar el contenido modificado
                    res.end(modifiedContent, 'utf-8');
                } else {
                    res.end(content, 'utf-8');
                }
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
            const password = postData.password;

            const user = users.find(user => user.nombre === username && user.password === password);

            if (user) {
                res.setHeader('Set-Cookie', `loggedInUser=${encodeURIComponent(JSON.stringify(user))}; HttpOnly; Path=/`);
                res.writeHead(302, { 'Location': '/' });
                res.end();
            } else {
                res.writeHead(401, { 'Content-Type': 'text/html' });
                res.end('<h1>Usuario o contraseña incorrectos</h1><a href="/login.html">Inténtalo de nuevo</a>');
            }
        });
    } else if (req.method === 'POST' && req.url === '/add-to-cart') {
        if (!loggedInUser) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'No autenticado' }));
            return;
        }

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const postData = JSON.parse(body);
            const productName = postData.product;
            console.log(`Añadiendo producto al carrito: ${productName} para ${loggedInUser.nombre}`);

            if (!carritos[loggedInUser.nombre]) {
                carritos[loggedInUser.nombre] = [];
            }
            carritos[loggedInUser.nombre].push(productName);
            console.log(`Carrito de ${loggedInUser.nombre}:`, carritos[loggedInUser.nombre]);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        });
    } else if (req.method === 'POST' && req.url === '/vaciar-carrito') {
        if (!loggedInUser) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'No autenticado' }));
            return;
        }

        // Vaciar el carrito del usuario
        carritos[loggedInUser.nombre] = [];
        console.log(`Carrito de ${loggedInUser.nombre} vaciado`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
    } else if (req.method === 'POST' && req.url === '/finalizar-compra') {
        if (!loggedInUser) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: 'No autenticado' }));
            return;
        }

        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const postData = JSON.parse(body);
            const address = postData.address;
            const cardNumber = postData.cardNumber;
            console.log(`Finalizando compra para ${loggedInUser.nombre} con dirección ${address} y tarjeta ${cardNumber}`);

            // Guardar el pedido en la base de datos (tienda.json)
            const pedido = {
                usuario: loggedInUser.nombre,
                direccion: address,
                tarjeta: cardNumber,
                productos: carritos[loggedInUser.nombre]
            };
            pedidos.push(pedido);

            // Guardar los pedidos actualizados en el archivo tienda.json
            fs.readFile(path.join(__dirname, 'tienda.json'), 'utf8', (err, data) => {
                if (err) {
                    console.error('Error al leer el archivo tienda.json:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, message: 'Error al guardar el pedido' }));
                    return;
                }

                const tienda = JSON.parse(data);
                tienda.Pedidos = pedidos;

                fs.writeFile(path.join(__dirname, 'tienda.json'), JSON.stringify(tienda, null, 2), (err) => {
                    if (err) {
                        console.error('Error al escribir el archivo tienda.json:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Error al guardar el pedido' }));
                        return;
                    }

                    console.log('Pedido guardado correctamente');
                    // Vaciar el carrito del usuario
                    carritos[loggedInUser.nombre] = [];
                    console.log(`Carrito de ${loggedInUser.nombre} después de finalizar la compra:`, carritos[loggedInUser.nombre]);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                });
            });
        });
    }
}).listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
