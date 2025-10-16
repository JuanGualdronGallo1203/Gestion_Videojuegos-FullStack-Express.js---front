// Validation Functions
class Validators {
    static validarProducto(producto) {
        const errors = [];

        // Validar nombre
        if (!producto.nombre || producto.nombre.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (producto.nombre && producto.nombre.length > 100) {
            errors.push('El nombre no puede exceder 100 caracteres');
        }

        // Validar tipo
        if (!producto.tipo || !['juego', 'consola'].includes(producto.tipo)) {
            errors.push('El tipo debe ser "juego" o "consola"');
        }

        // Validar precio
        if (!producto.precio || producto.precio < 0) {
            errors.push('El precio debe ser un número positivo');
        }

        if (producto.precio > 1000000) {
            errors.push('El precio no puede exceder $1,000,000');
        }

        // Validar cantidad
        if (!producto.cantidad || producto.cantidad < 0) {
            errors.push('La cantidad debe ser un número positivo');
        }

        if (!Number.isInteger(Number(producto.cantidad))) {
            errors.push('La cantidad debe ser un número entero');
        }

        // Validar descripción
        if (producto.descripcion && producto.descripcion.length > 500) {
            errors.push('La descripción no puede exceder 500 caracteres');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static validarVenta(venta) {
        const errors = [];

        // Validar productoId
        if (!venta.productoId) {
            errors.push('El ID del producto es requerido');
        }

        // Validar cantidad
        if (!venta.cantidad || venta.cantidad < 1) {
            errors.push('La cantidad debe ser al menos 1');
        }

        if (!Number.isInteger(Number(venta.cantidad))) {
            errors.push('La cantidad debe ser un número entero');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static sanitizarTexto(texto) {
        if (!texto) return '';
        return texto.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    static sanitizarNumero(numero) {
        if (!numero && numero !== 0) return null;
        const num = Number(numero);
        return isNaN(num) ? null : num;
    }
}