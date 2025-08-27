import { useEffect, useRef, useState } from 'react'

// Hook for intersection observer (lazy loading, infinite scroll, etc.)
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [entry, setEntry] = useState(null)
  const elementRef = useRef(null)

  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  }

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
      setEntry(entry)
    }, defaultOptions)

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [defaultOptions.root, defaultOptions.rootMargin, defaultOptions.threshold])

  return [elementRef, isIntersecting, entry]
}

// Hook for lazy loading images
export const useLazyImage = (src, placeholder = '') => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [imageRef, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  })

  useEffect(() => {
    if (isIntersecting && src) {
      setImageSrc(src)
    }
  }, [isIntersecting, src])

  return [imageRef, imageSrc]
}

// Hook for infinite scroll
export const useInfiniteScroll = (callback, hasMore = true) => {
  const [isFetching, setIsFetching] = useState(false)
  const [elementRef, isIntersecting] = useIntersectionObserver({
    threshold: 1.0,
    rootMargin: '100px'
  })

  useEffect(() => {
    if (isIntersecting && hasMore && !isFetching) {
      setIsFetching(true)
      callback().finally(() => setIsFetching(false))
    }
  }, [isIntersecting, hasMore, isFetching, callback])

  return [elementRef, isFetching]
}
