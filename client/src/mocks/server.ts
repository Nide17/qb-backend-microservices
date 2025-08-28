import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API responses
export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body as { email: string; password: string };
    
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'user',
          },
          token: 'mock-jwt-token',
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ message: 'Invalid credentials' })
    );
  }),
  
  // Add more mock handlers as needed
];

export const server = setupServer(...handlers);

export default server;
