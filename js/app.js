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
        // Initialize navigation (esto setea los listeners de los tabs)
        NavigationHelper.init();
        
        // Initialize UI components (esto setea listeners de botones, modales, etc.)
        ProductosUI.init();
        VentasUI.init();
        
        // Show default section
        // ESTA LÍNEA ES CLAVE: Carga la app y muestra la sección de productos,
        // lo que a su vez dispara loadProducts() a través del NavigationHelper.
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
            const errorMsg = event.reason?.message || 'Error en operación asíncrona';
            Helpers.showNotification(errorMsg, 'error');
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
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
}

.stat-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    padding: 2rem 1.5rem;
    border-radius: 16px;
    box-shadow: 
        0 4px 20px rgba(0, 0, 0, 0.08),
        0 1px 4px rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    gap: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.8);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 
        0 8px 30px rgba(0, 0, 0, 0.12),
        0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-card:hover::before {
    transform: scaleX(1);
}

.stat-icon {
    font-size: 2.25rem;
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 18px;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
    transform: scale(1.1);
}

/* Variantes de colores para los iconos */
.stat-icon.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.stat-icon.success {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
}

.stat-icon.warning {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: white;
}

.stat-icon.danger {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    color: white;
}

.stat-icon.secondary {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    color: #495057;
}

.stat-info {
    flex: 1;
}

.stat-info h3 {
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    line-height: 1.2;
}

.stat-info p {
    margin: 0.5rem 0 0 0;
    color: #718096;
    font-size: 0.95rem;
    font-weight: 500;
}

.stat-trend {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    margin-top: 0.5rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
}

.stat-trend.positive {
    background: rgba(72, 187, 120, 0.1);
    color: #48bb78;
}

.stat-trend.negative {
    background: rgba(245, 101, 101, 0.1);
    color: #f56565;
}

/* Badges mejorados */
.badge {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 700;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1;
    transition: all 0.2s ease;
}

.badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.bg-primary { 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.bg-secondary { 
    background: linear-gradient(135deg, #868e96 0%, #495057 100%);
    color: white;
}

.bg-success { 
    background: linear-gradient(135deg, #51cf66 0%, #2b8a3e 100%);
    color: white;
}

.bg-danger { 
    background: linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%);
    color: white;
}

.bg-warning { 
    background: linear-gradient(135deg, #ffd43b 0%, #f08c00 100%);
    color: #212529;
}

/* Progress bars mejoradas */
.progress {
    background: rgba(0, 0, 0, 0.06);
    border-radius: 12px;
    overflow: hidden;
    height: 8px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar {
    height: 100%;
    border-radius: 12px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.progress-bar::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.4), 
        transparent
    );
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        left: -100%;
    }
    100% {
        left: 100%;
    }
}

/* Utilidades de texto mejoradas */
.text-muted { 
    color: #a0aec0 !important; 
    font-weight: 500;
}

.text-center { 
    text-align: center; 
}

/* Responsive */
@media (max-width: 768px) {
    .stats-container {
        grid-template-columns: 1fr;
        gap: 1rem;
        margin: 1rem 0;
    }
    
    .stat-card {
        padding: 1.5rem 1rem;
        gap: 1rem;
    }
    
    .stat-icon {
        width: 60px;
        height: 60px;
        font-size: 1.75rem;
    }
    
    .stat-info h3 {
        font-size: 1.75rem;
    }
    
    .stat-info p {
        font-size: 0.9rem;
    }
}
`;

// Add additional CSS to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Este es el único listener para DOMContentLoaded
document.addEventListener('DOMContentLoaded', function()  {
    GameStoreApp.init();
});

// Make global functions available
window.GameStoreApp = GameStoreApp;