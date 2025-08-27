import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  position = 'top-right',
  showProgress = true 
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (duration > 0) {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100))
          if (newProgress <= 0) {
            clearInterval(progressInterval)
            handleClose()
            return 0
          }
          return newProgress
        })
      }, 100)

      return () => clearInterval(progressInterval)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      if (onClose) onClose()
    }, 300)
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-success text-white'
      case 'error':
        return 'bg-danger text-white'
      case 'warning':
        return 'bg-warning text-dark'
      case 'info':
      default:
        return 'bg-info text-white'
    }
  }

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 start-0'
      case 'top-center':
        return 'top-0 start-50 translate-middle-x'
      case 'top-right':
      default:
        return 'top-0 end-0'
      case 'bottom-left':
        return 'bottom-0 start-0'
      case 'bottom-center':
        return 'bottom-0 start-50 translate-middle-x'
      case 'bottom-right':
        return 'bottom-0 end-0'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle'
      case 'error':
        return 'fas fa-exclamation-circle'
      case 'warning':
        return 'fas fa-exclamation-triangle'
      case 'info':
      default:
        return 'fas fa-info-circle'
    }
  }

  if (!isVisible) return null

  const toastElement = (
    <div 
      className={`position-fixed ${getPositionStyles()} m-3`}
      style={{ zIndex: 9999 }}
    >
      <div 
        className={`toast show ${getTypeStyles()}`}
        style={{
          minWidth: '300px',
          animation: isVisible ? 'slideInRight 0.3s ease' : 'slideOutRight 0.3s ease'
        }}
      >
        <div className="toast-header">
          <i className={`${getIcon()} me-2`}></i>
          <strong className="me-auto text-capitalize">{type}</strong>
          <button 
            type="button" 
            className="btn-close" 
            onClick={handleClose}
            aria-label="Close"
          ></button>
        </div>
        <div className="toast-body">
          {message}
          {showProgress && duration > 0 && (
            <div className="progress mt-2" style={{ height: '3px' }}>
              <div 
                className="progress-bar bg-light"
                style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(toastElement, document.body)
}

export default Toast
