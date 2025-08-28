# Testing Guide

This document provides a comprehensive overview of the testing setup and best practices for the React application.

## Table of Contents
1. [Testing Stack](#testing-stack)
2. [Test Setup](#test-setup)
3. [Test Utilities](#test-utilities)
4. [Testing Components](#testing-components)
5. [Testing Hooks](#testing-hooks)
6. [Mocking API Calls](#mocking-api-calls)
7. [Testing Redux](#testing-redux)
8. [Testing React Query](#testing-react-query)
9. [Testing Routing](#testing-routing)
10. [Best Practices](#best-practices)
11. [Running Tests](#running-tests)

## Testing Stack

- **Jest**: Test runner and assertion library
- **React Testing Library**: For testing React components
- **MSW (Mock Service Worker)**: For mocking API requests
- **@testing-library/user-event**: For simulating user interactions
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **@testing-library/react-hooks**: For testing custom hooks
- **Redux Mock Store**: For testing Redux-related code

## Test Setup

### `setupTests.ts`

This file runs before each test file and sets up the testing environment:

- **Browser Mocks**:
  - `matchMedia` for responsive design testing
  - `scrollTo` for testing scroll behavior
  - `localStorage` and `sessionStorage` mocks

- **MSW Setup**:
  - Starts the mock service worker before all tests
  - Resets handlers between tests
  - Closes the worker after all tests complete

- **Test Configuration**:
  - Sets up `test-id` attribute for consistent element selection
  - Configures React Testing Library settings

## Test Utilities

### `test-utils.tsx`

Custom test utilities that wrap the application with all necessary providers:

- **Custom Render Function**:
  - Wraps components with all context providers
  - Supports preloaded Redux state
  - Handles routing with React Router
  - Provides theme context

- **Helper Functions**:
  - `renderWithRouter`: For testing components that use routing
  - `renderHookWithProviders`: For testing hooks with all providers
  - `createTestStore`: For creating a Redux store with custom state

## Testing Components

### Basic Component Test

```typescript
import { render, screen } from '../test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
import { render, screen, fireEvent } from '../test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Testing Hooks

### Custom Hook Test

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

## Mocking API Calls

### MSW Setup

API mocks are defined in `src/mocks/server.ts`:

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/user', (req, res, ctx) => {
    return res(
      ctx.json({ name: 'Test User' })
    );
  })
];

export const server = setupServer(...handlers);
```

### Using Mocks in Tests

```typescript
import { server } from '../mocks/server';
import { rest } from 'msw';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads user data', async () => {
  server.use(
    rest.get('/api/user', (req, res, ctx) => {
      return res(ctx.json({ name: 'Mocked User' }));
    })
  );
  
  // Test code that makes the API call
});
```

## Testing Redux

### Testing Redux Slices

```typescript
import { configureStore } from '@reduxjs/toolkit';
import counterReducer, { increment } from './counterSlice';

describe('counter reducer', () => {
  it('should handle initial state', () => {
    expect(counterReducer(undefined, { type: 'unknown' })).toEqual({
      value: 0,
      status: 'idle',
    });
  });

  it('should handle increment', () => {
    const actual = counterReducer({ value: 0 }, increment());
    expect(actual.value).toEqual(1);
  });
});
```

### Testing Redux Components

```typescript
import { render, screen } from '../test-utils';
import { Provider } from 'react-redux';
import { store } from '../../app/store';
import Counter from './Counter';

describe('Counter', () => {
  it('renders with initial state', () => {
    render(
      <Provider store={store}>
        <Counter />
      </Provider>
    );
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
```

## Testing React Query

### Setup Test Query Client

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};
```

### Testing Query Hooks

```typescript
import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { useUser } from './userHooks';

describe('useUser', () => {
  it('fetches user data', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result, waitFor } = renderHook(() => useUser('1'), { wrapper });
    
    await waitFor(() => result.current.isSuccess);
    
    expect(result.current.data.name).toEqual('Test User');
  });
});
```

## Testing Routing

### Testing Navigation

```typescript
import { render, screen } from '../test-utils';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

test('navigates to about page', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </MemoryRouter>
  );
  
  userEvent.click(screen.getByText(/about/i));
  expect(screen.getByText(/about page/i)).toBeInTheDocument();
});
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Test what users see and interact with
   - Avoid testing implementation details

2. **Use Semantic Queries**
   - Prefer `getByRole` over other queries
   - Use `findBy*` for async operations
   - Use `queryBy*` when asserting something doesn't exist

3. **Mock External Dependencies**
   - Mock API calls with MSW
   - Mock timers and dates
   - Mock browser APIs when needed

4. **Keep Tests Isolated**
   - Reset state between tests
   - Don't share state between tests
   - Use `beforeEach` and `afterEach` for setup/teardown

5. **Write Accessible Tests**
   - Use proper ARIA roles and labels
   - Test keyboard navigation
   - Ensure color contrast meets accessibility standards

## Running Tests

### Run All Tests
```bash
npm test
```

### Run in Watch Mode
```bash
npm test -- --watch
```

### Run Coverage Report
```bash
npm test -- --coverage
```

### Update Snapshots
```bash
npm test -- -u
```

### Debug Tests
Add `debug()` to your test to see the rendered output:

```typescript
test('debug example', () => {
  const { debug } = render(<Component />);
  debug();
});
```

## Common Issues and Solutions

### Testing Components with Hooks
If you encounter issues with hooks, make sure to use `@testing-library/react-hooks` and wrap your component in the appropriate providers.

### Testing Asynchronous Code
Always use `async/await` with `waitFor` or `findBy*` queries when dealing with asynchronous operations.

### Debugging Tests
Use `screen.debug()` to inspect the rendered output during test execution.

## Additional Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [MSW Documentation](https://mswjs.io/docs/)
- [React Testing Library Cheatsheet](https://testing-library.com/docs/dom-testing-library/cheatsheet/)
