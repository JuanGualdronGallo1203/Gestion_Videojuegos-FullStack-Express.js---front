// Product Service Layer
class ProductosService {
    static async cargarProductos() {
        try {
            const response = await ProductosApi.obtenerTodos();
            
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: `${response.data.length} productos cargados`
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Error al cargar productos',
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

    static async crearProducto(productoData) {
        // Validar datos
        const validacion = Validators.validarProducto(productoData);
        if (!validacion.isValid) {
            return {
                success: false,
                errors: validacion.errors
            };
        }

        try {
            const response = await ProductosApi.crear(productoData);
            
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: 'Producto creado exitosamente'
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Error al crear producto',
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

    static async actualizarProducto(id, productoData) {
        // Validar datos
        const validacion = Validators.validarProducto(productoData);
        if (!validacion.isValid) {
            return {
                success: false,
                errors: validacion.errors
            };
        }

        try {
            const response = await ProductosApi.actualizar(id, productoData);
            
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: 'Producto actualizado exitosamente'
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Error al actualizar producto',
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

    static async eliminarProducto(id) {
        try {
            const response = await ProductosApi.eliminar(id);
            
            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Producto eliminado exitosamente'
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Error al eliminar producto'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async buscarProductos(nombre) {
        if (!nombre || nombre.trim().length < 2) {
            // Si la búsqueda es muy corta, cargar todos los productos
            return await this.cargarProductos();
        }

        try {
            const response = await ProductosApi.buscarPorNombre(nombre);
            
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: `${response.data.length} productos encontrados`
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Error en la búsqueda',
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

    static async obtenerProductosBajoStock() {
        try {
            const response = await ProductosApi.obtenerBajoStock();
            
            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: `${response.data.length} productos con stock bajo`
                };
            } else {
                return {
                    success: false,
                    error: response.error || 'Error al cargar productos con stock bajo',
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

    static filtrarProductos(productos, filtros = {}) {
        let productosFiltrados = [...productos];

        // Filtrar por tipo
        if (filtros.tipo) {
            productosFiltrados = productosFiltrados.filter(
                producto => producto.tipo === filtros.tipo
            );
        }

        // Filtrar por stock
        if (filtros.stock === 'bajo') {
            productosFiltrados = productosFiltrados.filter(
                producto => producto.cantidad < 5 && producto.cantidad > 0
            );
        } else if (filtros.stock === 'sin') {
            productosFiltrados = productosFiltrados.filter(
                producto => producto.cantidad === 0
            );
        }

        return productosFiltrados;
    }
}