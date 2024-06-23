function cargarProductoEspecifico() {
    fetch('../../tienda.json')
        .then(response => response.json())
        .then(data => {
            const producto = data.Productos.find(p => p.nombre === "Greatest Hits Vol. 1");
            const infoProducto = document.getElementById('infoProducto');
            if (producto) {
                infoProducto.innerHTML = `
                    <h2>${producto.nombre}</h2>
                    <p><strong>Artista:</strong> ${producto.artista}</p>
                    <p><strong>Año de Lanzamiento:</strong> ${producto.año}</p>
                    <p><strong>Género:</strong> ${producto.género}</p>
                    ${producto.discos.map(disco => `
                        <h4>${disco.titulo}</h4>
                        <ol class="lista">
                            ${disco.canciones.map(cancion => `<li>${cancion}</li>`).join('')}
                        </ol>
                    `).join('')}
                    <h2>${producto.precio}</h2>
                    <p>Quedan ${producto.cantidad_en_stock} en stock</p>
                `;
            } else {
                infoProducto.innerHTML = 'Producto no encontrado';
            }
        })
        .catch(error => console.error('Error al cargar el archivo JSON:', error));
}

function addToCart(productName) {
    fetch('/add-to-cart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ product: productName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('"Greatest Hits Vol. 1" ha sido añadido al carrito');
            window.location.reload();
        } else if (data.message === 'Producto agotado') {
            alert('Este producto está agotado.');
        } else {
            alert('Inicie sesión para poder añadir productos al carrito');
        }
    });
}

function redirectToCart() {
    fetch('/check-auth')
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                window.location.href = '/carrito.html';
            } else {
                window.location.href = '/login.html';
            }
        })
        .catch(error => {
            console.error('Error checking auth:', error);
        });
}

window.onload = cargarProductoEspecifico;