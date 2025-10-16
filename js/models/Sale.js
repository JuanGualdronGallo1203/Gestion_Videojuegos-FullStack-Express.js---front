// Sales UI Component
class VentasUI {
    static ventasData = [];
    static productosDisponibles = [];

    static init() {
        console.log('🛒 Inicializando VentasUI...');
        this.setupEventListeners();
    }

    static setupEventListeners() {
        // Button: Nueva Venta
        const btnNuevaVenta = document.getElementById('btnNuevaVenta');
        if (btnNuevaVenta) {
            btnNuevaVenta.addEventListener('click', () => this.abrirModalNuevaVenta());
        }

        // Modal: Cerrar
        const cerrarModalVenta = document.getElementById('cerrarModalVenta');
        if (cerrarModalVenta) {
            cerrarModalVenta.addEventListener('click', () => {
                ModalHelper.closeModal('modalVenta');
            });
        }

        // Modal: Cancelar
        const cancelarVenta = document.getElementById('cancelarVenta');
        if (cancelarVenta) {
            cancelarVenta.addEventListener('click', () => {
                ModalHelper.closeModal('modalVenta');
            });
        }

        // Form: Submit
        const formVenta = document.getElementById('formVenta');
        if (formVenta) {
            formVenta.addEventListener('submit', (e) => this.handleSubmitVenta(e));
        }

        // Select: Producto change
        const selectProducto = document.getElementById('selectProducto');
        if (selectProducto) {
            selectProducto.addEventListener('change', () => this.actualizarInfoProducto());
        }

        // Input: Cantidad change
        const cantidadVenta = document.getElementById('cantidadVenta');
        if (cantidadVenta) {
            cantidadVenta.addEventListener('input', () => this.actualizarResumenVenta());
        }
    }

    static async loadSales() {
        console.log('📊 Cargando ventas...');
        Helpers.showLoading('loadingVentas');

        const result = await VentasService.cargarVentas();

        Helpers.hideLoading('loadingVentas');

        if (result.success) {
            this.ventasData = result.data;
            this.renderSales(result.data);
            this.actualizarContadorVentas();
            console.log(`✅ ${result.data.length} ventas cargadas`);
        } else {
            Helpers.showNotification(result.error || 'Error al cargar ventas', 'error');
            this.renderSales([]);
        }
    }

    static renderSales(ventas) {
        const tbody = document.getElementById('tablaVentasBody');
        if (!tbody) return;

        if (ventas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <p style="padding: 2rem; color: #6c757d;">
                            📭 No hay ventas registradas
                        </p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = ventas.map(venta => this.createSaleRow(venta)).join('');
    }

    static createSaleRow(venta) {
        const productoNombre = venta.producto?.nombre || venta.productoNombre || 'Producto desconocido';
        const cantidad = venta.cantidad || 0;
        const precioUnitario = venta.precioUnitario || venta.precio || 0;
        const total = venta.total || (cantidad * precioUnitario);
        const fecha = Helpers.formatDate(venta.fecha || venta.createdAt);

        return `
            <tr data-venta-id="${venta._id}">
                <td>
                    <strong>${productoNombre}</strong>
                </td>
                <td>${cantidad}</td>
                <td>${Helpers.formatCurrency(precioUnitario)}</td>
                <td><strong>${Helpers.formatCurrency(total)}</strong></td>
                <td>${fecha}</td>
                <td>
                    <button class="btn-action btn-delete" onclick="VentasUI.eliminarVenta('${venta._id}')" title="Eliminar venta">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }

    static async abrirModalNuevaVenta() {
        // Cargar productos disponibles
        await this.cargarProductosParaVenta();
        
        // Limpiar formulario
        ModalHelper.clearForm('formVenta');
        
        // Ocultar info y resumen
        const infoProducto = document.getElementById('infoProducto');
        const resumenVenta = document.getElementById('resumenVenta');
        if (infoProducto) infoProducto.classList.add('hidden');
        if (resumenVenta) resumenVenta.classList.add('hidden');
        
        // Abrir modal
        ModalHelper.openModal('modalVenta');
    }

    static async cargarProductosParaVenta() {
        const selectProducto = document.getElementById('selectProducto');
        if (!selectProducto) return;

        selectProducto.innerHTML = '<option value="">Cargando productos...</option>';

        const result = await ProductosService.cargarProductos();

        if (result.success) {
            this.productosDisponibles = result.data;
            
            // Filtrar solo productos con stock
            const productosConStock = result.data.filter(p => p.cantidad > 0);

            if (productosConStock.length === 0) {
                selectProducto.innerHTML = '<option value="">No hay productos con stock disponible</option>';
                Helpers.showNotification('No hay productos disponibles para vender', 'warning');
                return;
            }

            selectProducto.innerHTML = `
                <option value="">Seleccionar producto...</option>
                ${productosConStock.map(producto => `
                    <option value="${producto._id}" data-precio="${producto.precio}" data-stock="${producto.cantidad}">
                        ${producto.nombre} - Stock: ${producto.cantidad} - ${Helpers.formatCurrency(producto.precio)}
                    </option>
                `).join('')}
            `;
        } else {
            selectProducto.innerHTML = '<option value="">Error al cargar productos</option>';
            Helpers.showNotification(result.error || 'Error al cargar productos', 'error');
        }
    }

    static actualizarInfoProducto() {
        const selectProducto = document.getElementById('selectProducto');
        const infoProducto = document.getElementById('infoProducto');
        const stockDisponible = document.getElementById('stockDisponible');
        const precioProducto = document.getElementById('precioProducto');
        const cantidadVenta = document.getElementById('cantidadVenta');

        if (!selectProducto || !infoProducto) return;

        const selectedOption = selectProducto.options[selectProducto.selectedIndex];
        
        if (!selectedOption || !selectedOption.value) {
            infoProducto.classList.add('hidden');
            return;
        }

        const stock = selectedOption.getAttribute('data-stock');
        const precio = selectedOption.getAttribute('data-precio');

        if (stockDisponible) stockDisponible.textContent = stock;
        if (precioProducto) precioProducto.textContent = precio;
        if (cantidadVenta) {
            cantidadVenta.max = stock;
            cantidadVenta.value = 1;
        }

        infoProducto.classList.remove('hidden');
        this.actualizarResumenVenta();
    }

    static actualizarResumenVenta() {
        const selectProducto = document.getElementById('selectProducto');
        const cantidadVenta = document.getElementById('cantidadVenta');
        const resumenVenta = document.getElementById('resumenVenta');
        const totalVenta = document.getElementById('totalVenta');
        const nuevoStock = document.getElementById('nuevoStock');

        if (!selectProducto || !cantidadVenta || !resumenVenta) return;

        const selectedOption = selectProducto.options[selectProducto.selectedIndex];
        
        if (!selectedOption || !selectedOption.value) {
            resumenVenta.classList.add('hidden');
            return;
        }

        const stock = parseInt(selectedOption.getAttribute('data-stock'));
        const precio = parseFloat(selectedOption.getAttribute('data-precio'));
        const cantidad = parseInt(cantidadVenta.value) || 0;

        if (cantidad > stock) {
            cantidadVenta.value = stock;
            Helpers.showNotification('La cantidad no puede exceder el stock disponible', 'warning');
            return;
        }

        const total = precio * cantidad;
        const stockRestante = stock - cantidad;

        if (totalVenta) totalVenta.textContent = total.toFixed(2);
        if (nuevoStock) nuevoStock.textContent = stockRestante;

        resumenVenta.classList.remove('hidden');
    }

    static async handleSubmitVenta(e) {
        e.preventDefault();

        const selectProducto = document.getElementById('selectProducto');
        const cantidadVenta = document.getElementById('cantidadVenta');

        if (!selectProducto || !cantidadVenta) return;

        const productoId = selectProducto.value;
        const cantidad = parseInt(cantidadVenta.value);

        if (!productoId) {
            Helpers.showNotification('Debe seleccionar un producto', 'error');
            return;
        }

        if (!cantidad || cantidad < 1) {
            Helpers.showNotification('La cantidad debe ser al menos 1', 'error');
            return;
        }

        // Obtener precio del producto seleccionado
        const selectedOption = selectProducto.options[selectProducto.selectedIndex];
        const precio = parseFloat(selectedOption.getAttribute('data-precio'));

        const ventaData = {
            productoId: productoId,
            cantidad: cantidad,
            precioUnitario: precio
        };

        console.log('📝 Registrando venta:', ventaData);

        const result = await VentasService.crearVenta(ventaData);

        if (result.success) {
            Helpers.showNotification(result.message || 'Venta registrada exitosamente', 'success');
            ModalHelper.closeModal('modalVenta');
            this.loadSales();
            ProductosUI.loadProducts(); // Actualizar productos para reflejar nuevo stock
            this.actualizarContadorVentas();
        } else {
            if (result.errors && result.errors.length > 0) {
                result.errors.forEach(error => {
                    Helpers.showNotification(error, 'error');
                });
            } else {
                Helpers.showNotification(result.error || 'Error al registrar venta', 'error');
            }
        }
    }

    static async eliminarVenta(id) {
        if (!confirm('¿Está seguro de eliminar esta venta? Esta acción no se puede deshacer.')) {
            return;
        }

        console.log('🗑️ Eliminando venta:', id);

        const result = await VentasService.eliminarVenta(id);

        if (result.success) {
            Helpers.showNotification(result.message || 'Venta eliminada exitosamente', 'success');
            this.loadSales();
            ProductosUI.loadProducts(); // Actualizar productos
            this.actualizarContadorVentas();
        } else {
            Helpers.showNotification(result.error || 'Error al eliminar venta', 'error');
        }
    }

    static async actualizarContadorVentas() {
        const ventasHoyElement = document.getElementById('ventasHoy');
        if (!ventasHoyElement) return;

        // Contar ventas de hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const ventasHoy = this.ventasData.filter(venta => {
            const fechaVenta = new Date(venta.fecha || venta.createdAt);
            fechaVenta.setHours(0, 0, 0, 0);
            return fechaVenta.getTime() === hoy.getTime();
        });

        ventasHoyElement.textContent = ventasHoy.length;
    }

    static async loadStatistics() {
        console.log('📈 Cargando estadísticas...');
        
        const result = await VentasService.obtenerEstadisticas();
        
        if (result.success && result.data) {
            this.renderStatistics(result.data);
        } else {
            Helpers.showNotification(result.error || 'Error al cargar estadísticas', 'error');
        }
    }

    static renderStatistics(stats) {
        const container = document.getElementById('estadisticasContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-info">
                    <h3>${Helpers.formatCurrency(stats.totalVentas || 0)}</h3>
                    <p>Total en Ventas</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🛒</div>
                <div class="stat-info">
                    <h3>${stats.cantidadVentas || 0}</h3>
                    <p>Ventas Realizadas</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                    <h3>${Helpers.formatCurrency(stats.promedioVenta || 0)}</h3>
                    <p>Promedio por Venta</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎮</div>
                <div class="stat-info">
                    <h3>${stats.productoMasVendido?.nombre || 'N/A'}</h3>
                    <p>Producto Más Vendido</p>
                </div>
            </div>
        `;
    }
}