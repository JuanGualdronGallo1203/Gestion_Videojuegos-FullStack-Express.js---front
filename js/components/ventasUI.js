// ui/ventasUI.js
class VentasUI {
    static ventas = [];
    static ventasFiltradas = [];

    static init() {
        console.log('🔧 Inicializando VentasUI...');
        this.setupEventListeners();
        this.loadVentas();
    }

    static setupEventListeners() {
        // Botón nueva venta
        const btnNuevaVenta = document.getElementById('btnNuevaVenta');
        if (btnNuevaVenta) {
            console.log('✅ Botón nueva venta encontrado');
            btnNuevaVenta.addEventListener('click', () => {
                console.log('🔄 Abriendo modal de venta...');
                this.showVentaForm();
            });
        } else {
            console.error('❌ No se encontró el botón btnNuevaVenta');
        }

        // Modal events
        const cerrarModal = document.getElementById('cerrarModalVenta');
        if (cerrarModal) {
            cerrarModal.addEventListener('click', () => {
                this.closeVentaModal();
            });
        }

        const cancelarVenta = document.getElementById('cancelarVenta');
        if (cancelarVenta) {
            cancelarVenta.addEventListener('click', () => {
                this.closeVentaModal();
            });
        }

        const formVenta = document.getElementById('formVenta');
        if (formVenta) {
            formVenta.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveVenta(e);
            });
        }

        // Eventos para calcular total automáticamente
        const productoSelect = document.getElementById('productoSelect');
        if (productoSelect) {
            productoSelect.addEventListener('change', () => {
                this.updatePrecioUnitario();
                this.calculateTotal();
            });
        }

        const cantidadVenta = document.getElementById('cantidadVenta');
        if (cantidadVenta) {
            cantidadVenta.addEventListener('input', () => {
                this.calculateTotal();
            });
        }

        // Cerrar modal al hacer clic fuera
        const modal = document.getElementById('modalVenta');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeVentaModal();
                }
            });
        }
    }

    static loadVentas() {
        console.log('📊 Cargando ventas...');
        try {
            // Verificar que el servicio existe
            if (typeof ventasServices === 'undefined') {
                throw new Error('Servicio de ventas no disponible');
            }

            this.ventas = ventasServices.obtenerVentas();
            console.log(`✅ ${this.ventas.length} ventas cargadas:`, this.ventas);
            
            this.ventasFiltradas = [...this.ventas];
            this.renderVentas();
        } catch (error) {
            console.error('❌ Error al cargar ventas:', error);
            this.ventas = [];
            this.ventasFiltradas = [];
            this.renderVentas();
        }
    }

    static renderVentas() {
        console.log('🎨 Renderizando ventas en tabla...');
        const tbody = document.getElementById('tablaVentasBody');
        
        if (!tbody) {
            console.error('❌ No se encontró tablaVentasBody');
            return;
        }

        if (this.ventasFiltradas.length === 0) {
            console.log('📭 No hay ventas para mostrar');
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 40px; color: #6c757d;">
                        <div style="font-size: 1.2rem; margin-bottom: 10px;">🛒</div>
                        <strong>No hay ventas registradas</strong>
                        <br>
                        <small>Haz clic en "Nueva Venta" para registrar la primera venta</small>
                    </td>
                </tr>
            `;
            return;
        }

        console.log(`🔄 Renderizando ${this.ventasFiltradas.length} ventas`);
        tbody.innerHTML = this.ventasFiltradas.map(venta => {
            console.log('📝 Procesando venta:', venta);
            return `
                <tr>
                    <td><strong>${this.escapeHtml(venta.productoNombre)}</strong></td>
                    <td>${venta.cantidad}</td>
                    <td>$${typeof venta.precioUnitario === 'number' ? venta.precioUnitario.toFixed(2) : '0.00'}</td>
                    <td><strong>$${typeof venta.total === 'number' ? venta.total.toFixed(2) : '0.00'}</strong></td>
                    <td>${venta.fecha || 'Sin fecha'}</td>
                    <td>
                        <div class="btn-group">
                            <button class="action-btn delete-btn" 
                                    onclick="VentasUI.deleteVenta(${venta.id})" 
                                    title="Eliminar venta">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        console.log('✅ Tabla de ventas actualizada');
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static showVentaForm() {
        console.log('📋 Mostrando formulario de venta');
        this.loadProductosParaVenta();
        this.clearVentaForm();
        
        const modal = document.getElementById('modalVenta');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
        } else {
            console.error('❌ No se encontró modalVenta');
        }
    }

    static closeVentaModal() {
        console.log('🔒 Cerrando modal de venta');
        const modal = document.getElementById('modalVenta');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('hidden');
        }
        this.clearVentaForm();
    }

    static clearVentaForm() {
        const form = document.getElementById('formVenta');
        if (form) {
            form.reset();
        }
        
        const precioUnitario = document.getElementById('precioUnitario');
        const totalVenta = document.getElementById('totalVenta');
        
        if (precioUnitario) precioUnitario.value = '';
        if (totalVenta) totalVenta.value = '';
    }

    static loadProductosParaVenta() {
        console.log('🔄 Cargando productos para venta...');
        const select = document.getElementById('productoSelect');
        if (!select) {
            console.error('❌ No se encontró productoSelect');
            return;
        }

        try {
            if (typeof ventasServices === 'undefined') {
                throw new Error('Servicio de ventas no disponible');
            }

            const productos = ventasServices.obtenerProductosParaVenta();
            console.log(`✅ ${productos.length} productos disponibles:`, productos);
            
            select.innerHTML = '<option value="">Seleccionar producto...</option>' +
                productos.map(producto => `
                    <option value="${producto.id}" data-precio="${producto.precio}">
                        ${this.escapeHtml(producto.name || producto.nombre)} - Stock: ${producto.stock} - $${typeof producto.precio === 'number' ? producto.precio.toFixed(2) : '0.00'}
                    </option>
                `).join('');

        } catch (error) {
            console.error('❌ Error al cargar productos para venta:', error);
            select.innerHTML = '<option value="">Error al cargar productos</option>';
        }
    }

    static updatePrecioUnitario() {
        const select = document.getElementById('productoSelect');
        const precioInput = document.getElementById('precioUnitario');
        
        if (!select || !precioInput) return;

        const selectedOption = select.options[select.selectedIndex];
        if (selectedOption && selectedOption.value) {
            const precio = selectedOption.getAttribute('data-precio');
            precioInput.value = parseFloat(precio).toFixed(2);
            console.log('💰 Precio unitario actualizado:', precioInput.value);
        } else {
            precioInput.value = '';
        }
    }

    static calculateTotal() {
        const precioInput = document.getElementById('precioUnitario');
        const cantidadInput = document.getElementById('cantidadVenta');
        const totalInput = document.getElementById('totalVenta');
        
        if (!precioInput || !cantidadInput || !totalInput) return;

        const precio = parseFloat(precioInput.value) || 0;
        const cantidad = parseInt(cantidadInput.value) || 0;
        
        totalInput.value = (precio * cantidad).toFixed(2);
        console.log('🧮 Total calculado:', totalInput.value);
    }

    static async saveVenta(event) {
        event.preventDefault();
        console.log('💾 Guardando venta...');

        const productoSelect = document.getElementById('productoSelect');
        const cantidadInput = document.getElementById('cantidadVenta');

        if (!productoSelect || !cantidadInput) {
            alert('❌ Error: Elementos del formulario no encontrados');
            return;
        }

        const productoId = parseInt(productoSelect.value);
        const cantidad = parseInt(cantidadInput.value);

        // Validaciones
        if (!productoId) {
            alert('⚠️ Por favor seleccione un producto');
            return;
        }

        if (!cantidad || cantidad <= 0) {
            alert('⚠️ Por favor ingrese una cantidad válida');
            return;
        }

        try {
            if (typeof ventasServices === 'undefined') {
                throw new Error('Servicio de ventas no disponible');
            }

            console.log('📦 Creando venta con:', { productoId, cantidad });
            const venta = ventasServices.crearVenta({
                productoId: productoId,
                cantidad: cantidad
            });

            console.log('✅ Venta creada:', venta);
            alert(`✅ Venta registrada exitosamente!\nProducto: ${venta.productoNombre}\nCantidad: ${venta.cantidad}\nTotal: $${venta.total.toFixed(2)}`);

            // Actualizar la interfaz
            this.closeVentaModal();
            this.loadVentas(); // Recargar ventas para mostrar la nueva
            
            // Si existe la UI de productos, actualizarla también
            if (typeof ProductosUI !== 'undefined' && typeof ProductosUI.loadProducts === 'function') {
                console.log('🔄 Actualizando lista de productos...');
                ProductosUI.loadProducts();
            }

        } catch (error) {
            console.error('❌ Error al guardar venta:', error);
            alert(`❌ Error: ${error.message}`);
        }
    }

    static deleteVenta(id) {
        console.log('🗑️ Solicitando eliminar venta:', id);
        
        if (!confirm('¿Estás seguro de que deseas eliminar esta venta?\n\nEsta acción restaurará el stock del producto.')) {
            return;
        }

        try {
            if (typeof ventasServices === 'undefined') {
                throw new Error('Servicio de ventas no disponible');
            }

            ventasServices.eliminarVenta(id);
            console.log('✅ Venta eliminada:', id);
            
            this.loadVentas(); // Recargar ventas después de eliminar
            alert('✅ Venta eliminada exitosamente');
            
            // Si existe la UI de productos, actualizarla también
            if (typeof ProductosUI !== 'undefined' && typeof ProductosUI.loadProducts === 'function') {
                console.log('🔄 Actualizando lista de productos...');
                ProductosUI.loadProducts();
            }
        } catch (error) {
            console.error('❌ Error al eliminar venta:', error);
            alert(`❌ Error: ${error.message}`);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, inicializando VentasUI...');
    VentasUI.init();
});

// También exportar para uso global
window.VentasUI = VentasUI;