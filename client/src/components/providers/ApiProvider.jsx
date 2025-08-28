import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setError } from '../../redux/slices/errorSlice';

const ApiProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Global error handler for uncaught errors
    const handleError = (error) => {
      console.error('Unhandled error:', error);
      dispatch(setError(error.message || 'An unexpected error occurred'));
    };

    // Global unhandled promise rejection handler
    const handleRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      dispatch(setError(event.reason?.message || 'An unexpected error occurred'));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [dispatch]);

  return children;
};

export default ApiProvider;
