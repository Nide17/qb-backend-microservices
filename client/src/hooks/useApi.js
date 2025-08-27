import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { apiCallHelper } from '../redux/configHelpers'
import { debounce } from '../utils/performance'

// Custom hook for API calls with loading states and error handling
export const useApi = (url, method = 'get', dependencies = [], options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { 
    immediate = true, 
    debounceMs = 0,
    retries = 3,
    actionType = 'api-call'
  } = options

  const getState = useSelector(state => state)

  const executeRequest = useCallback(async (body = null) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiCallHelper(url, method, body, () => getState, actionType, retries)
      setData(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url, method, getState, actionType, retries])

  const debouncedExecute = debounceMs > 0 
    ? debounce(executeRequest, debounceMs)
    : executeRequest

  useEffect(() => {
    if (immediate && method === 'get') {
      executeRequest()
    }
  }, dependencies)

  return {
    data,
    loading,
    error,
    execute: debouncedExecute,
    refetch: executeRequest
  }
}

// Hook for paginated API calls
export const usePaginatedApi = (baseUrl, pageSize = 10) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)

  const getState = useSelector(state => state)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const url = `${baseUrl}?page=${page}&limit=${pageSize}`
      const result = await apiCallHelper(url, 'get', null, () => getState, 'paginated-load')
      
      if (result.data && result.data.length > 0) {
        setData(prev => [...prev, ...result.data])
        setPage(prev => prev + 1)
        setHasMore(result.data.length === pageSize)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [baseUrl, page, pageSize, loading, hasMore, getState])

  const reset = useCallback(() => {
    setData([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [])

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset
  }
}

// Hook for form submissions with validation
export const useFormSubmit = (submitUrl, method = 'post', validationRules = {}) => {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const getState = useSelector(state => state)

  const validate = useCallback((formData) => {
    const newErrors = {}
    
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field]
      const value = formData[field]

      if (rules.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = `${field} is required`
      } else if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `${field} must be at least ${rules.minLength} characters`
      } else if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field] = 'Please enter a valid email address'
      } else if (rules.custom && !rules.custom(value)) {
        newErrors[field] = rules.message || `${field} is invalid`
      }
    })

    return newErrors
  }, [validationRules])

  const submit = useCallback(async (formData) => {
    setLoading(true)
    setErrors({})
    setSuccess(false)

    // Validate form data
    const validationErrors = validate(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setLoading(false)
      return { success: false, errors: validationErrors }
    }

    try {
      const result = await apiCallHelper(submitUrl, method, formData, () => getState, 'form-submit')
      setSuccess(true)
      return { success: true, data: result }
    } catch (err) {
      setErrors({ submit: err.message || 'Submission failed' })
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }, [submitUrl, method, validate, getState])

  return {
    loading,
    errors,
    success,
    submit,
    clearErrors: () => setErrors({}),
    clearSuccess: () => setSuccess(false)
  }
}
