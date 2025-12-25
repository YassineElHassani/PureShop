import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Request, Response as ExpressResponse } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path: string;
  method: string;
  duration?: number;
}

@Injectable()
export class TransformInterceptor<T = any>
  implements NestInterceptor<T, ApiResponse<T>>
{
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<ExpressResponse>();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.debug(
          `${method} ${url} - ${response.statusCode} [${duration}ms]`,
        );
      }),
      map((data) => {
        const statusCode = response.statusCode || 200;
        const isSuccess = statusCode >= 200 && statusCode < 300;
        const duration = Date.now() - startTime;

        return {
          success: isSuccess,
          statusCode,
          message: this.getMessageByStatusCode(statusCode),
          data: isSuccess ? data : undefined,
          error: !isSuccess ? this.getErrorMessage(data) : undefined,
          timestamp: new Date().toISOString(),
          path: url,
          method,
          duration,
        };
      }),
    );
  }

  private getMessageByStatusCode(statusCode: number): string {
    const messages: { [key: number]: string } = {
      200: 'Request successful',
      201: 'Resource created successfully',
      202: 'Request accepted',
      204: 'No content',
      400: 'Bad request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Resource not found',
      409: 'Conflict',
      422: 'Unprocessable entity',
      500: 'Internal server error',
      502: 'Bad gateway',
      503: 'Service unavailable',
    };
    return messages[statusCode] || 'Operation completed';
  }

  private getErrorMessage(data: any): string {
    if (typeof data === 'string') {
      return data;
    }
    if (data?.message) {
      return data.message;
    }
    if (data?.error) {
      return data.error;
    }
    return 'An error occurred';
  }
}