
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 9090;

http.createServer((req, res) => {
    console.log(`Request for ${req.url}`);

    let filePath;

    // Determinar la ruta del archivo basada en la solicitud URL.
    switch (req.url) {
        case '/':
            filePath = path.join(__dirname, 'index.html');
            break;
        case '/producto1':
            filePath = path.join(__dirname, 'Productos', 'Producto1', 'producto1.html');
            break;
        case '/producto2':
            filePath = path.join(__dirname, 'producto2.html');
            break;
        case '/producto3':
            filePath = path.join(__dirname, 'producto3.html');
            break;
        default:
            // Para cualquier otra ruta, construir la ruta del archivo solicitado.
            filePath = path.join(__dirname, req.url);
            break;
    }

    let extname = String(path.extname(filePath)).toLowerCase();

    let mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif'
        // Añade más tipos MIME según sea necesario.
    };

    let contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                // Archivo no encontrado: servir la página 404.
                fs.readFile(path.join(__dirname, 'error.html'), (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // Error interno del servidor.
                res.writeHead(500);
                res.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
            }
        } else {
            // Si no hay errores, servir el archivo con el tipo de contenido adecuado.
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}).listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});


