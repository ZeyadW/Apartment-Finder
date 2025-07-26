import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  data?: any;
  constructor(message: string, statusCode = 500, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: err.data || null
  });
} 