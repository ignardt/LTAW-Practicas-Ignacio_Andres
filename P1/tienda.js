
// Cargar módulos nativos de Node.js
const http = require('http'); // Para crear el servidor HTTP.
const fs = require('fs'); // Para interactuar con el sistema de archivos.
const path = require('path'); // Para manipular rutas de archivos.

// Definir el puerto en el que el servidor estará escuchando.
const port = 9090;

// Crear el servidor HTTP.
http.createServer((req, res) => {
    console.log(`Request for ${req.url}`); // Loguear la solicitud para propósitos de debug.

    // Construir la ruta del archivo solicitado. Si se solicita "/", servir "index.html".
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

    // Obtener la extensión del archivo para determinar el tipo de contenido.
    let extname = String(path.extname(filePath)).toLowerCase();

    // Mapa de posibles tipos de contenido según la extensión del archivo.
    let mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif'
    };

    // Definir el tipo de contenido de la respuesta basado en la extensión del archivo solicitado.
    let contentType = mimeTypes[extname] || 'application/octet-stream';

    // Leer el archivo solicitado del sistema de archivos.
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                // Archivo no encontrado: servir la página 404.
                fs.readFile('error.html', (error, content) => {
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
    // El servidor comienza a escuchar en el puerto definido.
    console.log(`Server running at http://localhost:${port}/`);
});
