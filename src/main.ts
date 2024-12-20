import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
// import { Interceptor } from './interceptor/nterceptor';
// import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'https://travel.shibil.site',
    credentials: true,
  });
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  // app.useGlobalInterceptors(new Interceptor());
  // app.use(cookieParser());
  await app.listen(3000);
  console.log('server connected  http://localhost:3000');
}
bootstrap();
