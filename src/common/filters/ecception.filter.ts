import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateResponse } from '../response/createResponse';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseObj = exception.getResponse();

      if (
        status === HttpStatus.BAD_REQUEST &&
        responseObj &&
        typeof responseObj === 'object' &&
        'message' in responseObj
      ) {
        const validationErrors = (responseObj as any).message;
        if (Array.isArray(validationErrors)) {
          message = validationErrors[0];
        } else {
          message = validationErrors;
        }
      } else {
        message = exception.message || message;
      }
    }

    const errorLog = {
      message,
      details: exception.details,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    this.logger.error(
      `[${request.method}] ${request.url}`,
      JSON.stringify(errorLog),
    );
    return CreateResponse.error(response, message, status);
  }
}
