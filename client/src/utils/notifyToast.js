import { toast } from 'react-toastify'

// Enhanced notification system with better UX
export const notify = (message, status = 'success', options = {}) => {
    const defaultOptions = {
        position: "bottom-center",
        autoClose: status === 'error' ? 8000 : 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        ...options
    }

    switch (status) {
        case 'error':
            return toast.error(message, defaultOptions)
        case 'warning':
            return toast.warning(message, defaultOptions)
        case 'info':
            return toast.info(message, defaultOptions)
        case 'success':
        default:
            return toast.success(message, defaultOptions)
    }
}

// Specialized notification functions
export const notifySuccess = (message, options) => notify(message, 'success', options)
export const notifyError = (message, options) => notify(message, 'error', options)
export const notifyWarning = (message, options) => notify(message, 'warning', options)
export const notifyInfo = (message, options) => notify(message, 'info', options)

// Loading notification with promise handling
export const notifyPromise = (promise, messages = {}) => {
    const defaultMessages = {
        pending: 'Processing...',
        success: 'Operation completed successfully',
        error: 'Operation failed'
    }
    
    const finalMessages = { ...defaultMessages, ...messages }
    
    return toast.promise(promise, finalMessages, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
    })
}

// Dismiss all notifications
export const dismissAllNotifications = () => toast.dismiss()