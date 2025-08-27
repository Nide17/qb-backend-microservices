import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow">
                <div className="card-header bg-danger text-white text-center">
                  <i className="fas fa-exclamation-triangle fa-2x mb-2"></i>
                  <h4 className="mb-0">Oops! Something went wrong</h4>
                </div>
                <div className="card-body text-center">
                  <p className="text-muted mb-4">
                    We encountered an unexpected error. Don't worry, our team has been notified.
                  </p>
                  
                  <div className="d-flex gap-2 justify-content-center flex-wrap">
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.reload()}
                    >
                      <i className="fas fa-refresh me-2"></i>
                      Reload Page
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => window.history.back()}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Go Back
                    </button>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => window.location.href = '/'}
                    >
                      <i className="fas fa-home me-2"></i>
                      Home
                    </button>
                  </div>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="mt-4">
                      <details className="text-start">
                        <summary className="btn btn-outline-secondary btn-sm">
                          View Error Details (Development)
                        </summary>
                        <div className="mt-3 p-3 bg-light border rounded">
                          <h6>Error:</h6>
                          <pre className="text-danger small">
                            {this.state.error && this.state.error.toString()}
                          </pre>
                          <h6>Component Stack:</h6>
                          <pre className="text-muted small">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
