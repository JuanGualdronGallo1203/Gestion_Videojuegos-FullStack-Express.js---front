// Sales API Layer
const API_BASE_URL = 'http://localhost:3000/api';

class VentasApi {
    // Get all sales
    static async obtenerTodas() {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener ventas');
            }
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error en obtenerTodas:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    // Create new sale
    static async crear(ventaData) {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ventaData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'Error al crear venta',
                    errors: data.errors || []
                };
            }
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error en crear:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get sale by ID
    static async obtenerPorId(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas/${id}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener venta');
            }
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error en obtenerPorId:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete sale
    static async eliminar(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'Error al eliminar venta'
                };
            }
            
            return {
                success: true,
                message: data.message || 'Venta eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error en eliminar:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get sales by date range
    static async obtenerPorFecha(fechaInicio, fechaFin) {
        try {
            const params = new URLSearchParams();
            if (fechaInicio) params.append('fechaInicio', fechaInicio);
            if (fechaFin) params.append('fechaFin', fechaFin);
            
            const response = await fetch(`${API_BASE_URL}/ventas/fecha?${params}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener ventas por fecha');
            }
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error en obtenerPorFecha:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    // Get sales statistics
    static async obtenerEstadisticas() {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas/estadisticas`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener estadísticas');
            }
            
            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('Error en obtenerEstadisticas:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }
}