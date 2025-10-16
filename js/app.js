// Main Application
class GameStoreApp {
    static init() {
        console.log('🎮 Inicializando GameStore Manager...');
        
        // Initialize components
        this.initializeApp();
        
        // Set up global event listeners
        this.setupGlobalEventListeners();
        
        console.log('✅ App inicializada correctamente');
    }

    static initializeApp() {
        // Initialize navigation
        NavigationHelper.init();
        
        // Initialize UI components
        ProductosUI.init();
        VentasUI.init();
        
        // Show default section
        NavigationHelper.showSection('productos');
    }

    static setupGlobalEventListeners() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Error global:', event.error);
            Helpers.showNotification('Ocurrió un error inesperado', 'error');
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promise rechazada no manejada:', event.reason);
            Helpers.showNotification('Error en operación asíncrona', 'error');
            event.preventDefault();
        });

        // Close modals with ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.active');
                modals.forEach(modal => {
                    ModalHelper.closeModal(modal.id);
                });
            }
        });

        // Close modals by clicking outside
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                ModalHelper.closeModal(event.target.id);
            }
        });
    }

    // Global function to change sections
    static changeSection(sectionId) {
        NavigationHelper.showSection(sectionId);
    }

    // Global function to reload data
    static async reloadData() {
        Helpers.showNotification('Recargando datos...', 'info');
        await ProductosUI.loadProducts();
        await VentasUI.loadSales();
    }
}

// Additional CSS for statistics
const additionalCSS = `
    .stats-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .stat-icon {
        font-size: 2rem;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
    }

    .stat-info h3 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
    }

    .stat-info p {
        margin: 0.2rem 0 0 0;
        color: #6c757d;
    }

    .badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 4px;
    }

    .bg-primary { background: #007bff; color: white; }
    .bg-secondary { background: #6c757d; color: white; }
    .bg-success { background: #28a745; color: white; }
    .bg-danger { background: #dc3545; color: white; }
    .bg-warning { background: #ffc107; color: #212529; }

    .progress {
        background: #e9ecef;
        border-radius: 4px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        transition: width 0.3s ease;
    }

    .text-muted { color: #6c757d !important; }
    .text-center { text-align: center; }
`;

// Add additional CSS to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', function()  {
    GameStoreApp.init();
       if (typeof ventasUI !== 'undefined') {
        ventasUI.cargarVentas();
        ventasUI.cargarProductosParaVenta();
       }
});



// Make global functions available
window.GameStoreApp = GameStoreApp;