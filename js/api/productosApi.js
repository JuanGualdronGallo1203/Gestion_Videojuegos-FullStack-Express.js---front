// API Functions for Products
class ProductosApi {
    static baseURL = 'http://localhost:3000/api';

    static async obtenerTodos() {
        try {
            const response = await fetch(`${this.baseURL}/productos`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    static async obtenerPorId(id) {
        try {
            const response = await fetch(`${this.baseURL}/productos/${id}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    static async crear(producto) {
        try {
            const response = await fetch(`${this.baseURL}/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(producto)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    static async actualizar(id, producto) {
        try {
            const response = await fetch(`${this.baseURL}/productos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(producto)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    static async eliminar(id) {
        try {
            const response = await fetch(`${this.baseURL}/productos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    static async buscarPorNombre(nombre) {
        try {
            const response = await fetch(`${this.baseURL}/productos/buscar/${encodeURIComponent(nombre)}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    static async obtenerBajoStock(limite = 5) {
        try {
            const response = await fetch(`${this.baseURL}/productos/bajo-stock?limite=${limite}`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching low stock products:', error);
            throw error;
        }
    }
}