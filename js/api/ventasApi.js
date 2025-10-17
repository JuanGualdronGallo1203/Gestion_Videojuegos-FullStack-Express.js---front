// Sales API Layer
const API_BASE_URL = 'http://localhost:3000/api';

class VentasApi {
    
    // --- FUNCIÓN CORREGIDA ---
    static async obtenerTodas() {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas`);
            const data = await response.json(); // data es { success: true, data: [...] }
            
            if (!response.ok) {
                // El backend ya envía un objeto de error
                throw new Error(data.error || 'Error al obtener ventas');
            }
            
            return data; // Devolver la respuesta directa del backend
        } catch (error) {
            console.error('Error en obtenerTodas:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // --- FUNCIÓN CORREGIDA ---
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
                // El backend ya envía { success: false, error: "..." }
                throw new Error(data.error || 'Error al crear venta');
            }
            
            return data; // Devolver la respuesta directa del backend
        } catch (error) {
            console.error('Error en crear:', error);
            return { success: false, error: error.message };
        }
    }

    // --- FUNCIÓN CORREGIDA ---
    static async obtenerPorId(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas/${id}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener venta');
            }
            
            return data; // Devolver la respuesta directa del backend
        } catch (error) {
            console.error('Error en obtenerPorId:', error);
            return { success: false, error: error.message };
        }
    }

    // --- FUNCIÓN CORREGIDA ---
    static async eliminar(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas/${id}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al eliminar venta');
            }
            
            return data; // Devolver la respuesta directa del backend
        } catch (error) {
            console.error('Error en eliminar:', error);
            return { success: false, error: error.message };
        }
    }

    // --- FUNCIÓN CORREGIDA ---
    static async obtenerPorFecha(fechaInicio, fechaFin) {
        try {
            const params = new URLSearchParams();
            if (fechaInicio) params.append('fechaInicio', fechaInicio);
            if (fechaFin) params.append('fechaFin', fechaFin);
            
            const response = await fetch(`${API_BASE_URL}/ventas/fecha?${params}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener ventas por fecha');
            }
            
            return data; // Devolver la respuesta directa del backend
        } catch (error) {
            console.error('Error en obtenerPorFecha:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // --- FUNCIÓN CORREGIDA ---
    static async obtenerEstadisticas() {
        try {
            const response = await fetch(`${API_BASE_URL}/ventas/estadisticas`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener estadísticas');
            }
            
            return data; // Devolver la respuesta directa del backend
        } catch (error) {
            console.error('Error en obtenerEstadisticas:', error);
            return { success: false, error: error.message, data: null };
        }
    }
}