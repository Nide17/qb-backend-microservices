import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, RenderHookOptions } from '@testing-library/react-hooks';
import { store as appStore, RootState } from './app/store';
import theme from './styles/theme';

interface WrapperProps {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>;
  route?: string;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const createTestStore = (preloadedState: Partial<RootState> = {}) => {
  return configureStore({
    reducer: appStore.reducer,
    preloadedState,
  });
};

export const AllTheProviders: React.FC<WrapperProps> = ({
  children,
  preloadedState = {},
  route = '/',
}) => {
  const store = createTestStore(preloadedState);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path="*" element={<>{children}</>} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { preloadedState?: Partial<RootState>; route?: string }
) => {
  const { preloadedState, route, ...rest } = options || {};
  
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders preloadedState={preloadedState} route={route} {...props} />
    ),
    ...rest,
  });
};

export const renderWithRouter = (
  ui: ReactElement,
  { route = '/', ...options }: Omit<RenderOptions, 'wrapper'> & { route?: string } = {}
) => {
  window.history.pushState({}, 'Test page', route);
  return customRender(ui, { ...options, route });
};

export const renderHookWithProviders = <TProps, TResult>(
  callback: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'> & {
    preloadedState?: Partial<RootState>;
    route?: string;
  }
) => {
  const { preloadedState, route, ...rest } = options || {};
  
  return renderHook(callback, {
    wrapper: (props) => (
      <AllTheProviders preloadedState={preloadedState} route={route} {...props} />
    ),
    ...rest,
  });
};

// Re-export everything including screen
export * from '@testing-library/react';
// Override render method
export { customRender as render };

// Explicitly re-export screen for better type inference
export { screen } from '@testing-library/react';
