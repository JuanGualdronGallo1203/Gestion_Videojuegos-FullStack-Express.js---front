// Products UI Component
class ProductosUI {
    static productos = [];
    static productosFiltrados = [];

    static init() {
        // init() SÓLO debe registrar los listeners, no cargar datos.
        // App.js se encargará de la carga inicial.
        this.setupEventListeners();
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
            const result = await ProductosService.cargarProductos();
            
            if (result.success) {
                this.productos = result.data || [];
                this.productosFiltrados = [...this.productos];
                this.renderProducts();
                this.updateHeaderStats();
                Helpers.showNotification(result.message || 'Productos cargados', 'success');
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
                    <td colspan="6" class="text-center" style="padding: 2rem; color: #6c757d;">
                        📭 No se encontraron productos
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.productosFiltrados.map(producto => {
            const status = Helpers.getStockStatus(producto.cantidad || 0);
            return `
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
                <td>${producto.cantidad || 0}</td>
                <td>
                    <span class="status-badge ${status.class}">${status.text}</span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn-action btn-edit" 
                                onclick="ProductosUI.editProduct('${producto._id}')" 
                                title="Editar producto">
                            ✏️
                        </button>
                        <button class="btn-action btn-sell" 
                                onclick="VentasUI.abrirModalNuevaVenta('${producto._id}')" 
                                title="Vender producto"
                                ${status.status === 'out' ? 'disabled' : ''}>
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
        `}).join('');
    }

    static async searchProducts(term) {
        const searchTerm = Helpers.sanitizeText(term);
        
        if (!searchTerm || searchTerm.length < 2) {
            this.filterProducts();
            return;
        }

        Helpers.showLoading('loadingProductos');
        try {
            const result = await ProductosService.buscarProductos(searchTerm);
            
            if (result.success) {
                this.productosFiltrados = result.data || [];
                this.renderProducts();
            } else {
                throw new Error(result.error || 'Error en la búsqueda');
            }
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        } finally {
            Helpers.hideLoading('loadingProductos');
        }
    }

    static filterProducts() {
        const tipo = document.getElementById('filtroTipo')?.value || '';
        const stock = document.getElementById('filtroStock')?.value || '';
        
        this.productosFiltrados = ProductosService.filtrarProductos(this.productos, { tipo, stock });
        
        this.renderProducts();
    }

    static showProductForm(producto = null) {
        const titulo = document.getElementById('tituloModalProducto');
        const form = document.getElementById('formProducto');
        const productoId = document.getElementById('productoId');

        if (producto) {
            titulo.textContent = 'Editar Producto';
            productoId.value = producto._id;
            document.getElementById('nombre').value = producto.nombre || '';
            document.getElementById('tipo').value = producto.tipo || '';
            document.getElementById('precio').value = producto.precio || '';
            document.getElementById('cantidad').value = producto.cantidad || '';
            document.getElementById('descripcion').value = producto.descripcion || '';
        } else {
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

        const btnGuardar = document.getElementById('btnGuardarProducto');
        const originalText = btnGuardar.innerHTML;
        btnGuardar.innerHTML = '<span>⏳</span> Guardando...';
        btnGuardar.disabled = true;

        try {
            let result;
            if (productoId) {
                result = await ProductosService.actualizarProducto(productoId, productoData);
            } else {
                result = await ProductosService.crearProducto(productoData);
            }

            if (result.success) {
                Helpers.showNotification(result.message || 'Producto guardado', 'success');
                ModalHelper.closeModal('modalProducto');
                await this.loadProducts(); 
            } else {
                const errorMsg = result.errors ? result.errors.join(', ') : (result.error || 'Error al guardar');
                Helpers.showNotification(errorMsg, 'error');
            }
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        } finally {
            btnGuardar.innerHTML = originalText;
            btnGuardar.disabled = false;
        }
    }

    static editProduct(id) {
        const producto = this.productos.find(p => p._id === id);
        
        if (producto) {
            this.showProductForm(producto);
        } else {
            Helpers.showNotification('Error: Producto no encontrado', 'error');
        }
    }

    static async deleteProduct(id) {
        const producto = this.productos.find(p => p._id === id);
        if (!producto) return;

        const confirmacion = confirm(`¿Estás seguro de que quieres eliminar "${producto.nombre}"?`);
        
        if (!confirmacion) return;

        try {
            const result = await ProductosService.eliminarProducto(id);
            
            if (result.success) {
                Helpers.showNotification(result.message || 'Producto eliminado', 'success');
                await this.loadProducts(); 
            } else {
                throw new Error(result.error || 'Error al eliminar el producto');
            }
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        }
    }

    static async loadLowStock() {
        Helpers.showLoading('loadingProductos');
        try {
            const result = await ProductosService.obtenerProductosBajoStock();
            
            if (result.success) {
                this.productosFiltrados = result.data || [];
                this.renderProducts();
                Helpers.showNotification(result.message || 'Mostrando productos con stock bajo', 'success');
            } else {
                throw new Error(result.error || 'Error al cargar stock bajo');
            }
        } catch (error) {
            Helpers.showNotification(error.message, 'error');
        } finally {
            Helpers.hideLoading('loadingProductos');
        }
    }

    static updateHeaderStats() {
        const totalProductos = document.getElementById('totalProductos');
        if (totalProductos) {
            totalProductos.textContent = this.productos.filter(p => p.activo !== false).length;
        }
    }
}

// --- LÍNEA AÑADIDA ---
// Esto "anuncia" la clase al navegador para que NavigationHelper la encuentre
window.ProductosUI = ProductosUI;