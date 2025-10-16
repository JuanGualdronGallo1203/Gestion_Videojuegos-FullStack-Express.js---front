// Utility Functions
class Helpers {
  // Format currency
  static formatCurrency(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  // Format date
  static formatDate(dateString) {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Fecha inválida"
    }
  }

  // Show notification
  static showNotification(message, type = "success", duration = 5000) {
    const notificationSystem = document.getElementById("notificationSystem")
    if (!notificationSystem) {
      console.log(`[${type.toUpperCase()}] ${message}`)
      return
    }

    const notification = document.createElement("div")
    notification.className = `notification ${type}`

    const icon = type === "success" ? "✅" : type === "error" ? "❌" : "⚠️"
    notification.innerHTML = `
            <span>${icon}</span>
            <span>${message}</span>
        `

    notificationSystem.appendChild(notification)

    // Auto remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, duration)

    return notification
  }

  // Show loading state
  static showLoading(elementId) {
    const element = document.getElementById(elementId)
    if (element) {
      element.classList.remove("hidden")
    }
  }

  // Hide loading state
  static hideLoading(elementId) {
    const element = document.getElementById(elementId)
    if (element) {
      element.classList.add("hidden")
    }
  }

  // Debounce function for search
  static debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Get stock status
  static getStockStatus(quantity) {
    if (quantity === 0) return { status: "out", text: "Sin Stock", class: "status-stock-out" }
    if (quantity < 5) return { status: "low", text: "Stock Bajo", class: "status-stock-low" }
    return { status: "ok", text: "En Stock", class: "status-stock-ok" }
  }

  // Sanitize text
  static sanitizeText(text) {
    if (!text) return ""
    return text.toString().trim()
  }

  // Parse number safely
  static parseNumber(value) {
    if (!value && value !== 0) return null
    const num = Number(value)
    return isNaN(num) ? null : num
  }
}

// Modal Helper
class ModalHelper {
  static openModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.add("active")
      document.body.style.overflow = "hidden"
    }
  }

  static closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = "auto"
    }
  }

  static clearForm(formId) {
    const form = document.getElementById(formId)
    if (form) {
      form.reset()
      // Clear hidden inputs
      const hiddenInputs = form.querySelectorAll('input[type="hidden"]')
      hiddenInputs.forEach((input) => (input.value = ""))
    }
  }
}

// Navigation Helper
class NavigationHelper {
  static init() {
    const navButtons = document.querySelectorAll(".nav-btn")
    navButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        const targetSection = button.getAttribute("data-section")
        this.showSection(targetSection)
      })
    })
  }

  static showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active")
    })

    // Remove active class from all buttons
    document.querySelectorAll(".nav-btn").forEach((button) => {
      button.classList.remove("active")
    })

    // Show target section
    const targetSection = document.getElementById(sectionId)
    if (targetSection) {
      targetSection.classList.add("active")
    }

    // Activate corresponding button
    const activeButton = document.querySelector(`[data-section="${sectionId}"]`)
    if (activeButton) {
      activeButton.classList.add("active")
    }

    // Load section data
    this.loadSectionData(sectionId)
  }

  static loadSectionData(sectionId) {
    switch (sectionId) {
      case "productos":
        if (window.ProductosUI) {
          window.ProductosUI.loadProducts()
        }
        break
      case "ventas":
        if (window.VentasUI) {
          window.VentasUI.loadSales()
        }
        break
      case "estadisticas":
        if (window.VentasUI) {
          window.VentasUI.loadStatistics()
        }
        break
    }
  }
}

window.Helpers = Helpers
window.ModalHelper = ModalHelper
window.NavigationHelper = NavigationHelper
