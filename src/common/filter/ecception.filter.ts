import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log('exception', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorMessage = exception.message;
    let errorDetails = exception.response;
    console.log('**ERROR** ->', errorMessage);
    if (exception instanceof HttpException) {
      errorMessage = exception.message;
      errorDetails = exception.getResponse();
    } else {
      errorMessage = 'An unexpected error occurred';
    }

    response.status(status).json({
      success: false,
      message: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
