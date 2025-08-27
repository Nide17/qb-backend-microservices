// Performance optimization utilities

// Debounce function for search inputs and API calls
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  }
  
  return new IntersectionObserver(callback, { ...defaultOptions, ...options })
}

// Image lazy loading utility
export const lazyLoadImage = (img, src, placeholder = '/images/placeholder.jpg') => {
  const observer = createIntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target
        image.src = src
        image.classList.add('loaded')
        observer.unobserve(image)
      }
    })
  })
  
  img.src = placeholder
  observer.observe(img)
}

// Memory usage monitoring (development only)
export const monitorMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memInfo = performance.memory
    console.log('Memory Usage:', {
      used: `${Math.round(memInfo.usedJSHeapSize / 1048576)} MB`,
      total: `${Math.round(memInfo.totalJSHeapSize / 1048576)} MB`,
      limit: `${Math.round(memInfo.jsHeapSizeLimit / 1048576)} MB`
    })
  }
}

// Bundle size analyzer (development only)
export const logBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0
    
    scripts.forEach(script => {
      fetch(script.src, { method: 'HEAD' })
        .then(response => {
          const size = response.headers.get('content-length')
          if (size) {
            totalSize += parseInt(size)
            console.log(`Script: ${script.src.split('/').pop()} - ${(size / 1024).toFixed(2)} KB`)
          }
        })
        .catch(() => {}) // Ignore CORS errors
    })
  }
}

// Performance metrics collection
export const collectPerformanceMetrics = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0]
    const paint = performance.getEntriesByType('paint')
    
    const metrics = {
      // Navigation timing
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      
      // Paint timing
      firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      
      // Connection info
      connectionType: navigator.connection?.effectiveType || 'unknown'
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', metrics)
    }
    
    return metrics
  }
  
  return null
}

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration)
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}

// Preload critical resources
export const preloadCriticalResources = (resources = []) => {
  resources.forEach(resource => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.href
    link.as = resource.as || 'fetch'
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin
    document.head.appendChild(link)
  })
}

// Cache management for API responses
export const createCacheManager = (maxSize = 50, ttl = 5 * 60 * 1000) => { // 5 minutes TTL
  const cache = new Map()
  
  return {
    get: (key) => {
      const item = cache.get(key)
      if (!item) return null
      
      if (Date.now() > item.expiry) {
        cache.delete(key)
        return null
      }
      
      return item.data
    },
    
    set: (key, data) => {
      // Remove oldest entries if cache is full
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value
        cache.delete(firstKey)
      }
      
      cache.set(key, {
        data,
        expiry: Date.now() + ttl
      })
    },
    
    clear: () => cache.clear(),
    size: () => cache.size
  }
}
