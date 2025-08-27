import React, { useState } from 'react'

const ImageWithFallback = ({ src, alt, fallbackSrc, id }) => {
    const [imageSrc, setImageSrc] = useState(src)
    const [imageLoaded, setImageLoaded] = useState(false)

    const handleImageError = () => {
        setImageSrc(fallbackSrc)
    }

    const handleImageLoad = () => {
        const img = new Image()
        img.src = imageSrc

        img.onload = () => {
            if (img.width > 0 && img.height > 0) {
                setImageLoaded(true)
            } else {
                setImageSrc(fallbackSrc)
            }
        }
    }

    return (
        <img
            src={imageLoaded ? imageSrc : fallbackSrc}
            alt={alt}
            id={id}
            onError={handleImageError}
            onLoad={handleImageLoad}
        />
    )
}

export default ImageWithFallback