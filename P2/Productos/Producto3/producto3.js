function cargarProductoEspecifico() {
    fetch('../../tienda.json')
        .then(response => response.json())
        .then(data => {
            const producto = data.Productos.find(p => p.nombre === "AC/DC Live");
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
            alert('"AC/DC Live" ha sido añadido al carrito');
        } else {
            alert('Inicie sesión para poder añadir productos al carrito');
        }
    });
}

function searchProduct() {
    const input = document.getElementById('search-input').value;
    const suggestionsBox = document.getElementById('suggestions');
    if (input.length >= 3) {
        fetch(`/search?query=${input}`)
            .then(response => response.json())
            .then(data => {
                suggestionsBox.innerHTML = '';
                if (data.length > 0) {
                    data.forEach(item => {
                        let div = document.createElement('div');
                        div.className = 'suggestion';
                        div.innerHTML = item.nombre;
                        div.onclick = () => {
                            document.getElementById('search-input').value = item.nombre;
                            suggestionsBox.innerHTML = '';
                            suggestionsBox.style.display = 'none';
                        };
                        suggestionsBox.appendChild(div);
                    });
                    suggestionsBox.style.display = 'block';
                } else {
                    suggestionsBox.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error);
            });
    } else {
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = 'none';
    }
}

function searchProductPage() {
    const input = document.getElementById('search-input').value;
    fetch(`/search?query=${input}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                window.location.href = data[0].ruta; 
            } else {
                console.error('Producto no encontrado');
            }
        })
        .catch(error => {
            console.error('Error searching product page:', error);
        });
}

window.onload = cargarProductoEspecifico;