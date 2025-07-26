import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoObject = plainToClass(dtoClass, req.query);
      const errors = await validate(dtoObject as object);

      if (errors.length > 0) {
        const validationErrors = errors.map(error => ({
          property: error.property,
          constraints: error.constraints
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      // Attach the validated DTO to the request
      (req as any).validatedQuery = dtoObject;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Validation error'
      });
    }
  };
} 