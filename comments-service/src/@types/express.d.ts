import { Request, Response, NextFunction } from 'express';

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

export type ExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

export type ErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

// Common response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// JWT User payload
export interface JwtUserPayload {
  userId: string;
  role: string;
  [key: string]: any;
}
