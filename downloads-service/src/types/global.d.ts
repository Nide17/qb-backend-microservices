// Global TypeScript declarations
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRE: string;
  }
}

type AsyncRequestHandler = (
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction
) => Promise<void>;

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        [key: string]: any;
      };
    }
  }
}

export {};
