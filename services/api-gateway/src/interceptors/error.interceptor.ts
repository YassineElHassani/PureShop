import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Handle timeout errors
        if (error instanceof TimeoutError) {
          this.logger.error('Request timeout', error.stack);
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.REQUEST_TIMEOUT,
                  message: 'Request timeout - Microservice did not respond in time',
                  timestamp: new Date().toISOString(),
                },
                HttpStatus.REQUEST_TIMEOUT,
              ),
          );
        }

        // Handle HTTP exceptions
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // Handle RPC exceptions from microservices (check direct properties first)
        if (error?.statusCode && error?.message) {
          this.logger.error(
            `Microservice error: ${error.message}`,
            error.stack,
          );
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: error.statusCode,
                  message: error.message,
                  timestamp: new Date().toISOString(),
                },
                error.statusCode,
              ),
          );
        }

        // Handle RPC exceptions from microservices (nested error object)
        if (error?.error?.statusCode) {
          this.logger.error(
            `Microservice error: ${error.error.message}`,
            error.stack,
          );
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: error.error.statusCode,
                  message: error.error.message || 'Microservice error',
                  timestamp: new Date().toISOString(),
                },
                error.error.statusCode,
              ),
          );
        }

        // Log unexpected errors
        this.logger.error('Unexpected error occurred');
        this.logger.error('Error details:', JSON.stringify(error, null, 2));
        this.logger.error('Error stack:', error.stack);

        return throwError(
          () =>
            new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
                timestamp: new Date().toISOString(),
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }
}