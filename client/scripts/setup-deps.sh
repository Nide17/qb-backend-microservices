#!/bin/bash

# Install TypeScript and type definitions
echo "Installing TypeScript and type definitions..."
npm install --save-dev typescript @types/node @types/react @types/react-dom @types/jest @types/react-router-dom @testing-library/jest-dom

# Install Redux Toolkit
echo "Installing Redux Toolkit..."
npm install @reduxjs/toolkit react-redux @types/react-redux

# Install testing dependencies
echo "Installing testing dependencies..."
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest ts-jest

# Install styled-components with types
echo "Installing styled-components..."
npm install styled-components @types/styled-components

# Install React Query
echo "Installing React Query..."
npm install @tanstack/react-query @tanstack/react-query-devtools

# Install other utility libraries
echo "Installing utility libraries..."
npm install react-helmet-async @types/react-helmet-async react-toastify @types/react-toastify

echo "Dependencies installed successfully!"
