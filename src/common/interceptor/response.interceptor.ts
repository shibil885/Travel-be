import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Response } from '../interfaces/response/response.interface';

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        const message =
          this.reflector.get<string>(
            'response_message',
            context.getHandler(),
          ) || 'Operation successful';

        const statusCode =
          this.reflector.get<number>('response_status', context.getHandler()) ||
          response.statusCode ||
          HttpStatus.OK;
        response.status(statusCode);

        return {
          success: true,
          message,
          data: data || {},
          statusCode,
        };
      }),
    );
  }
}
