import React from 'react'
import { useInfiniteScroll } from '../../hooks/useIntersectionObserver'

const InfiniteScroll = ({ 
  children, 
  hasMore, 
  loadMore, 
  loading = false,
  loader = null,
  endMessage = null,
  className = ''
}) => {
  const [elementRef, isFetching] = useInfiniteScroll(loadMore, hasMore)

  const defaultLoader = (
    <div className="text-center py-3">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading more...</span>
      </div>
    </div>
  )

  const defaultEndMessage = (
    <div className="text-center py-3 text-muted">
      <p>No more items to load</p>
    </div>
  )

  return (
    <div className={`infinite-scroll-container ${className}`}>
      {children}
      
      {hasMore && (
        <div ref={elementRef} className="infinite-scroll-trigger">
          {(loading || isFetching) && (loader || defaultLoader)}
        </div>
      )}
      
      {!hasMore && (endMessage || defaultEndMessage)}
    </div>
  )
}

export default InfiniteScroll
