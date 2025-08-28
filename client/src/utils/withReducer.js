import React, { useEffect } from 'react';
import { useStore } from 'react-redux';

/**
 * Higher-order component that dynamically injects a reducer
 * @param {string} key The key to inject the reducer under
 * @param {Function} reducer The reducer to inject
 * @returns {Function} A higher-order component
 */
const withReducer = (key, reducer) => (WrappedComponent) => {
  const WithReducer = (props) => {
    const store = useStore();

    useEffect(() => {
      // Inject the reducer when the component mounts
      if (store.reducerManager) {
        store.reducerManager.add(key, reducer);
      }

      // Clean up by removing the reducer when the component unmounts
      return () => {
        if (store.reducerManager) {
          store.reducerManager.remove(key);
        }
      };
    }, [store, key, reducer]);

    return <WrappedComponent {...props} />;
  };

  // Set a display name for debugging
  WithReducer.displayName = `withReducer(${key})`;
  
  return WithReducer;
};

export default withReducer;
