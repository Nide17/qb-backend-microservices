import React, { useState } from 'react'
import { useLazyImage } from '../../hooks/useIntersectionObserver'

const LazyImage = ({ 
  src, 
  alt, 
  placeholder = '/images/placeholder.jpg',
  className = '',
  style = {},
  onLoad,
  onError,
  ...props 
}) => {
  const [imageRef, imageSrc] = useLazyImage(src, placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = (e) => {
    setIsLoaded(true)
    if (onLoad) onLoad(e)
  }

  const handleError = (e) => {
    setHasError(true)
    if (onError) onError(e)
  }

  return (
    <div ref={imageRef} className={`lazy-image-container ${className}`} style={style}>
      <img
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`lazy-image ${isLoaded ? 'loaded' : ''} ${hasError ? 'error' : ''}`}
        style={{
          opacity: isLoaded ? 1 : 0.7,
          transition: 'opacity 0.3s ease',
          ...style
        }}
        {...props}
      />
      {!isLoaded && !hasError && (
        <div className="lazy-image-placeholder">
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default LazyImage
