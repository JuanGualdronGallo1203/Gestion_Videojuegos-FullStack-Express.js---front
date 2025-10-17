// (Este es el archivo que antes se llamaba js/models/Sale.js)
class VentasUI {
    static ventasData = [];
    static productosDisponibles = [];

    static init() {
        console.log('🛒 Inicializando VentasUI...');
        // init() SÓLO debe registrar los listeners
        this.setupEventListeners();
    }

    static setupEventListeners() {
        // Button: Nueva Venta
        document.getElementById('btnNuevaVenta')?.addEventListener('click', () => this.abrirModalNuevaVenta());

        // Modal: Cerrar
        document.getElementById('cerrarModalVenta')?.addEventListener('click', () => ModalHelper.closeModal('modalVenta'));

        // Modal: Cancelar
        document.getElementById('cancelarVenta')?.addEventListener('click', () => ModalHelper.closeModal('modalVenta'));

        // Form: Submit
        document.getElementById('formVenta')?.addEventListener('submit', (e) => this.handleSubmitVenta(e));

        // Select: Producto change
        document.getElementById('selectProducto')?.addEventListener('change', () => this.actualizarInfoProducto());

        // Input: Cantidad change
        document.getElementById('cantidadVenta')?.addEventListener('input', () => this.actualizarResumenVenta());

        // Botón: Actualizar Estadísticas
        document.getElementById('btnActualizarStats')?.addEventListener('click', () => this.loadStatistics());
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
        const productoNombre = venta.nombreProducto || 'Producto desconocido';
        const cantidad = venta.cantidad || 0;
        const precioUnitario = venta.precioUnitario || 0;
        const total = venta.total || (cantidad * precioUnitario);
        const fecha = Helpers.formatDate(venta.fecha);

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

    static async abrirModalNuevaVenta(productoId = null) {
        ModalHelper.clearForm('formVenta');
        
        const infoProducto = document.getElementById('infoProducto');
        const resumenVenta = document.getElementById('resumenVenta');
        if (infoProducto) infoProducto.classList.add('hidden');
        if (resumenVenta) resumenVenta.classList.add('hidden');
        
        ModalHelper.openModal('modalVenta');
        
        await this.cargarProductosParaVenta(productoId);
    }

    static async cargarProductosParaVenta(productoId = null) {
        const selectProducto = document.getElementById('selectProducto');
        if (!selectProducto) return;

        selectProducto.innerHTML = '<option value="">Cargando productos...</option>';
        selectProducto.disabled = true;

        const result = await ProductosService.cargarProductos();

        if (result.success) {
            this.productosDisponibles = result.data;
            
            const productosConStock = result.data.filter(p => p.cantidad > 0 || p._id === productoId);

            if (productosConStock.length === 0) {
                selectProducto.innerHTML = '<option value="">No hay productos con stock disponible</option>';
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
            
            selectProducto.disabled = false;

            if (productoId) {
                selectProducto.value = productoId;
                selectProducto.dispatchEvent(new Event('change'));
            }

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
        const btnProcesarVenta = document.getElementById('btnProcesarVenta');

        if (!selectProducto || !infoProducto) return;

        const selectedOption = selectProducto.options[selectProducto.selectedIndex];
        
        if (!selectedOption || !selectedOption.value) {
            infoProducto.classList.add('hidden');
            btnProcesarVenta.disabled = true;
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

        if (parseInt(stock) === 0) {
            Helpers.showNotification('Este producto no tiene stock disponible', 'error');
            btnProcesarVenta.disabled = true;
            infoProducto.classList.add('hidden'); 
        } else {
            btnProcesarVenta.disabled = false;
            infoProducto.classList.remove('hidden');
            this.actualizarResumenVenta();
        }
    }

    static actualizarResumenVenta() {
        const selectProducto = document.getElementById('selectProducto');
        const cantidadVenta = document.getElementById('cantidadVenta');
        const resumenVenta = document.getElementById('resumenVenta');

        if (!selectProducto || !cantidadVenta || !resumenVenta) return;

        const selectedOption = selectProducto.options[selectProducto.selectedIndex];
        
        if (!selectedOption || !selectedOption.value) {
            resumenVenta.classList.add('hidden');
            return;
        }

        const stock = parseInt(selectedOption.getAttribute('data-stock'));
        const precio = parseFloat(selectedOption.getAttribute('data-precio'));
        let cantidad = parseInt(cantidadVenta.value) || 0;

        if (cantidad > stock) {
            cantidadVenta.value = stock;
            cantidad = stock;
            Helpers.showNotification('La cantidad no puede exceder el stock disponible', 'warning');
        }
        
        if (cantidad < 0) {
           cantidadVenta.value = 1;
           cantidad = 1;
        }

        this.actualizarResumenVentaConValores(stock, precio, cantidad);
    }

    static actualizarResumenVentaConValores(stock, precio, cantidad) {
        const resumenVenta = document.getElementById('resumenVenta');
        const totalVenta = document.getElementById('totalVenta');
        const nuevoStock = document.getElementById('nuevoStock');

        const total = precio * cantidad;
        const stockRestante = stock - cantidad;

        if (totalVenta) totalVenta.textContent = Helpers.formatCurrency(total);
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

        const ventaData = {
            productoId: productoId,
            cantidad: cantidad,
        };

        const result = await VentasService.crearVenta(ventaData);

        if (result.success) {
            Helpers.showNotification(result.message || 'Venta registrada exitosamente', 'success');
            ModalHelper.closeModal('modalVenta');
            this.loadSales(); 
            ProductosUI.loadProducts();
        } else {
            const errorMsg = result.errors ? result.errors.map(e => e.message || e).join(', ') : (result.error || 'Error al registrar venta');
            Helpers.showNotification(errorMsg, 'error');
        }
    }

    static async eliminarVenta(id) {
        if (!confirm('¿Está seguro de eliminar esta venta? El stock del producto será restaurado.')) {
            return;
        }

        const result = await VentasService.eliminarVenta(id);

        if (result.success) {
            Helpers.showNotification(result.message || 'Venta eliminada exitosamente', 'success');
            this.loadSales();
            ProductosUI.loadProducts();
        } else {
            Helpers.showNotification(result.error || 'Error al eliminar venta', 'error');
        }
    }

    static async actualizarContadorVentas() {
        const ventasHoyElement = document.getElementById('ventasHoy');
        if (!ventasHoyElement) return;

        const hoy = new Date().toDateString();

        const ventasHoy = this.ventasData.filter(venta => {
            const fechaVenta = new Date(venta.fecha).toDateString();
            return fechaVenta === hoy;
        });

        ventasHoyElement.textContent = ventasHoy.length;
    }

    static async loadStatistics() {
        console.log('📈 Cargando estadísticas...');
        const container = document.getElementById('estadisticasContainer');
        if (!container) return;

        container.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Cargando estadísticas...</p></div>`;
        
        const result = await VentasService.obtenerEstadisticas();
        
        if (result.success && result.data) {
            this.renderStatistics(result.data);
        } else {
            Helpers.showNotification(result.error || 'Error al cargar estadísticas', 'error');
            container.innerHTML = `<p class="text-center text-danger">Error al cargar estadísticas</p>`;
        }
    }

    static renderStatistics(stats) {
        const container = document.getElementById('estadisticasContainer');
        if (!container) return;

        const { resumen, ventasPorProducto } = stats;

        const totalVentas = resumen.totalVentas || 0;
        const totalUnidades = resumen.totalUnidades || 0;
        const promedioVenta = resumen.ventaPromedio || 0;
        
        let productoMasVendido = "N/A";
        let unidadesMasVendido = 0;
        if(ventasPorProducto.length > 0) {
            productoMasVendido = ventasPorProducto[0]._id;
            unidadesMasVendido = ventasPorProducto[0].unidadesVendidas;
        }

        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon primary">💰</div>
                <div class="stat-info">
                    <h3>${Helpers.formatCurrency(totalVentas)}</h3>
                    <p>Total en Ventas</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon success">🛒</div>
                <div class="stat-info">
                    <h3>${totalUnidades}</h3>
                    <p>Unidades Vendidas</p>
                </div>
            </div>
            <div class.stat-card">
                <div class="stat-icon warning">📊</div>
                <div class.stat-info">
                    <h3>${Helpers.formatCurrency(promedioVenta)}</h3>
                    <p>Promedio por Venta</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon secondary">🎮</div>
                <div class="stat-info">
                    <h3>${productoMasVendido}</h3>
                    <p>Producto Más Vendido (${unidadesMasVendido} unidades)</p>
                </div>
            </div>
        `;
    }
}

window.VentasUI = VentasUI;