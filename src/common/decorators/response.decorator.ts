import { SetMetadata } from '@nestjs/common';

export const ResponseMessage = (message: string) =>
  SetMetadata('response_message', message);

export const ResponseStatus = (statusCode: number) =>
  SetMetadata('response_status', statusCode);

export const ApiResponse = (message: string, statusCode?: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('response_message', message)(target, propertyKey, descriptor);
    if (statusCode) {
      SetMetadata('response_status', statusCode)(
        target,
        propertyKey,
        descriptor,
      );
    }
  };
};
