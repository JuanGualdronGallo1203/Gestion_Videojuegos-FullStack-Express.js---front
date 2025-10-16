// Sales Service Layer
class VentasService {
    static async cargarVentas() {
        try {
            const response = await VentasApi.obtenerTodas();
            
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: `${response.data.length} ventas cargadas`
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Error al cargar ventas',
                    data: []
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    static async crearVenta(ventaData) {
        // Validar datos
        const validacion = Validators.validarVenta(ventaData);
        if (!validacion.isValid) {
            return {
                success: false,
                errors: validacion.errors
            };
        }

        try {
            const response = await VentasApi.crear(ventaData);
            
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: 'Venta registrada exitosamente'
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Error al registrar venta',
                    errors: response.errors || []
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async eliminarVenta(id) {
        if (!id) {
            return {
                success: false,
                error: 'ID de venta no válido'
            };
        }

        try {
            const response = await VentasApi.eliminar(id);
            
            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Venta eliminada exitosamente'
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Error al eliminar venta'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async obtenerEstadisticas() {
        try {
            const response = await VentasApi.obtenerEstadisticas();
            
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: 'Estadísticas cargadas'
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Error al cargar estadísticas',
                    data: null
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    static async obtenerVentasPorFecha(fechaInicio, fechaFin) {
        try {
            const response = await VentasApi.obtenerPorFecha(fechaInicio, fechaFin);
            
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: `${response.data.length} ventas encontradas`
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Error al buscar ventas',
                    data: []
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    static calcularTotalVenta(precio, cantidad) {
        const precioNum = Helpers.parseNumber(precio);
        const cantidadNum = Helpers.parseNumber(cantidad);
        
        if (precioNum === null || cantidadNum === null) {
            return 0;
        }
        
        return precioNum * cantidadNum;
    }

    static filtrarVentas(ventas, filtros = {}) {
        let ventasFiltradas = [...ventas];

        // Filtrar por producto
        if (filtros.productoId) {
            ventasFiltradas = ventasFiltradas.filter(
                venta => venta.productoId === filtros.productoId || 
                         venta.producto?._id === filtros.productoId
            );
        }

        // Filtrar por rango de fechas
        if (filtros.fechaInicio) {
            const fechaInicio = new Date(filtros.fechaInicio);
            ventasFiltradas = ventasFiltradas.filter(
                venta => new Date(venta.fecha) >= fechaInicio
            );
        }

        if (filtros.fechaFin) {
            const fechaFin = new Date(filtros.fechaFin);
            ventasFiltradas = ventasFiltradas.filter(
                venta => new Date(venta.fecha) <= fechaFin
            );
        }

        return ventasFiltradas;
    }
}