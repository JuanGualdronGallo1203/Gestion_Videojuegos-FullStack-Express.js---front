// Products UI Component
class ProductosUI {
    static productos = [];
    static productosFiltrados = [];

    static init() {
        this.setupEventListeners();
        this.loadProducts();
    }

    static setupEventListeners() {
        // Nuevo producto
        document.getElementById('btnNuevoProducto')?.addEventListener('click', () => {
            this.showProductForm();
        });

        // Stock bajo
        document.getElementById('btnStockBajo')?.addEventListener('click', () => {
            this.loadLowStock();
        });

        // Búsqueda con debounce
        const buscarInput = document.getElementById('buscarProducto');
        if (buscarInput) {
            buscarInput.addEventListener('input', 
                Helpers.debounce((e) => this.searchProducts(e.target.value), 300)
            );
        }

        // Filtros
        document.getElementById('filtroTipo')?.addEventListener('change', () => this.filterProducts());
        document.getElementById('filtroStock')?.addEventListener('change', () => this.filterProducts());

        // Modal events
        document.getElementById('cerrarModalProducto')?.addEventListener('click', () => {
            ModalHelper.closeModal('modalProducto');
        });

        document.getElementById('cancelarProducto')?.addEventListener('click', () => {
            ModalHelper.closeModal('modalProducto');
        });

        document.getElementById('formProducto')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct(e);
        });
    }

    static async loadProducts() {
        Helpers.showLoading('loadingProductos');
        
        try {
            const result = await ProductosApi.obtenerTodos();
            
            if (result.success) {
                this.productos = result.data || [];
                this.productosFiltrados = [...this.productos];
                this.renderProducts();
                this.updateHeaderStats();
                Helpers.showNotification(`Cargados ${this.productos.length} productos`, 'success');
            } else {
                throw new Error(result.error || 'Error al cargar productos');
            }
        } catch (error) {
            this.productos = [];
            this.productosFiltrados = [];
            this.renderProducts();
            Helpers.showNotification(error.message, 'error');
        } finally {
            Helpers.hideLoading('loadingProductos');
        }
    }

    static renderProducts() {
        const tbody = document.getElementById('tablaProductosBody');
        if (!tbody) return;

        if (this.productosFiltrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        No se encontraron productos
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.productosFiltrados.map(producto => `
            <tr>
                <td>
                    <strong>${Helpers.sanitizeText(producto.nombre)}</strong>
                    ${producto.descripcion ? `<br><small class="text-muted">${Helpers.sanitizeText(producto.descripcion)}</small>` : ''}
                </td>
                <td>
                    <span class="badge ${producto.tipo === 'juego' ? 'bg-primary' : 'bg-secondary'}">
                        ${producto.tipo === 'juego' ? '🎮 Juego' : '🕹️ Consola'}
                    </span>
                </td>
                <td>${Helpers.formatCurrency(producto.precio || 0)}</td>
                <td>
                    <span>${producto.cantidad || 0}</span>
                    <div class="progress" style="height: 4px; margin-top: 5px; width: 80px;">
                        <div class="progress-bar ${producto.cantidad === 0 ? 'bg-danger' : producto.cantidad < 5 ? 'bg-warning' : 'bg-success'}" 
                             style="width: ${Math.min(((producto.cantidad || 0) / 10) * 100, 100)}%">
                        </div>
                    </div>
                </td>
                <td>
                    ${this.renderStockStatus(producto.cantidad || 0)}
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn-action btn-edit" 
                                onclick="ProductosUI.editProduct('${producto._id}')" 
                                title="Editar producto">
                            ✏️
                        </button>
                        <button class="btn-action btn-sell" 
                                onclick="VentasUI.showSaleModal('${producto._id}')" 
                                title="Vender producto"
                                ${(producto.cantidad || 0) === 0 ? 'disabled' : ''}>
                            🛒
                        </button>
                        <button class="btn-action btn-delete" 
                                onclick="ProductosUI.deleteProduct('${producto._id}')" 
                                title="Eliminar producto">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    static renderStockStatus(quantity) {
        const status = Helpers.getStockStatus(quantity);
        return `<span class="status-badge ${status.class}">${status.text}</span>`;
    }

    static async searchProducts(term) {
        const searchTerm = Helpers.sanitizeText(term);
        
        if (!searchTerm || searchTerm.length < 2) {
            this.productosFiltrados = [...this.productos];
            this.renderProducts();
            return;
        }

        try {
            const result = await ProductosApi.buscarPorNombre(searchTerm);
            
            if (result.success) {
                this.productosFiltrados = result.data || [];
                this.renderProducts();
            } else {
                throw new Error(result.error || 'Error en la búsqueda');
            }
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        }
    }

    static filterProducts() {
        const tipo = document.getElementById('filtroTipo')?.value || '';
        const stock = document.getElementById('filtroStock')?.value || '';
        
        let filtered = [...this.productos];

        // Filtrar por tipo
        if (tipo) {
            filtered = filtered.filter(producto => producto.tipo === tipo);
        }

        // Filtrar por stock
        if (stock === 'bajo') {
            filtered = filtered.filter(producto => (producto.cantidad || 0) < 5 && (producto.cantidad || 0) > 0);
        } else if (stock === 'sin') {
            filtered = filtered.filter(producto => (producto.cantidad || 0) === 0);
        }

        this.productosFiltrados = filtered;
        this.renderProducts();
    }

    static showProductForm(producto = null) {
        const titulo = document.getElementById('tituloModalProducto');
        const form = document.getElementById('formProducto');
        const productoId = document.getElementById('productoId');

        if (producto) {
            // Modo edición
            titulo.textContent = 'Editar Producto';
            productoId.value = producto._id;
            document.getElementById('nombre').value = producto.nombre || '';
            document.getElementById('tipo').value = producto.tipo || '';
            document.getElementById('precio').value = producto.precio || '';
            document.getElementById('cantidad').value = producto.cantidad || '';
            document.getElementById('descripcion').value = producto.descripcion || '';
        } else {
            // Modo creación
            titulo.textContent = 'Nuevo Producto';
            ModalHelper.clearForm('formProducto');
        }

        ModalHelper.openModal('modalProducto');
    }

    static async saveProduct(event) {
        event.preventDefault();
        
        const productoId = document.getElementById('productoId').value;
        const productoData = {
            nombre: document.getElementById('nombre').value,
            tipo: document.getElementById('tipo').value,
            precio: Helpers.parseNumber(document.getElementById('precio').value),
            cantidad: Helpers.parseNumber(document.getElementById('cantidad').value),
            descripcion: document.getElementById('descripcion').value
        };

        // Validaciones básicas
        if (!productoData.nombre || !productoData.tipo || productoData.precio === null || productoData.cantidad === null) {
            Helpers.showNotification('Por favor complete todos los campos requeridos', 'error');
            return;
        }

        const btnGuardar = document.getElementById('btnGuardarProducto');
        const originalText = btnGuardar.innerHTML;
        btnGuardar.innerHTML = '<span>⏳</span> Guardando...';
        btnGuardar.disabled = true;

        try {
            let result;
            if (productoId) {
                result = await ProductosApi.actualizar(productoId, productoData);
            } else {
                result = await ProductosApi.crear(productoData);
            }

            if (result.success) {
                Helpers.showNotification(result.message || 'Producto guardado exitosamente', 'success');
                ModalHelper.closeModal('modalProducto');
                await this.loadProducts();
            } else {
                throw new Error(result.error || 'Error al guardar el producto');
            }
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        } finally {
            btnGuardar.innerHTML = originalText;
            btnGuardar.disabled = false;
        }
    }

    static async editProduct(id) {
        try {
            const response = await ProductosApi.obtenerPorId(id);
            
            if (response.success) {
                this.showProductForm(response.data);
            } else {
                throw new Error(response.error || 'Error al cargar el producto');
            }
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        }
    }

    static async deleteProduct(id) {
        const producto = this.productos.find(p => p._id === id);
        if (!producto) return;

        const confirmacion = confirm(`¿Estás seguro de que quieres eliminar el producto "${producto.nombre}"?\n\nEsta acción no se puede deshacer.`);
        
        if (!confirmacion) return;

        try {
            // Primero verificar si el producto tiene ventas asociadas
            const ventas = JSON.parse(localStorage.getItem('ventas')) || [];
            const ventasAsociadas = ventas.filter(venta => venta.productoId === id);
            
            if (ventasAsociadas.length > 0) {
                throw new Error(`No se puede eliminar el producto porque tiene ${ventasAsociadas.length} venta(s) asociada(s)`);
            }

            // Eliminar de la base de datos usando el servicio
            const result = await ProductosService.eliminarProducto(id);
            
            if (result.success) {
                Helpers.showNotification(result.message || 'Producto eliminado exitosamente', 'success');
                
                // Actualizar la lista de productos local
                this.productos = this.productos.filter(p => p._id !== id);
                this.productosFiltrados = this.productosFiltrados.filter(p => p._id !== id);
                this.renderProducts();
                this.updateHeaderStats();
                
                // También eliminar del localStorage para mantener consistencia
                const productosLocal = JSON.parse(localStorage.getItem('productos')) || [];
                const productosActualizados = productosLocal.filter(p => p.id !== id);
                localStorage.setItem('productos', JSON.stringify(productosActualizados));
                
            } else {
                throw new Error(result.error || 'Error al eliminar el producto de la base de datos');
            }
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        }
    }

    static async loadLowStock() {
        try {
            const result = await ProductosApi.obtenerBajoStock();
            
            if (result.success) {
                this.productosFiltrados = result.data || [];
                this.renderProducts();
                Helpers.showNotification(`Mostrando ${this.productosFiltrados.length} productos con stock bajo`, 'success');
            } else {
                throw new Error(result.error || 'Error al cargar productos con stock bajo');
            }
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        }
    }

    static updateHeaderStats() {
        const totalProductos = document.getElementById('totalProductos');
        if (totalProductos) {
            totalProductos.textContent = this.productos.length;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    ProductosUI.init();
});