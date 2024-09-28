import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  await app.listen(3000);
  console.log('server connected  http://localhost:3000');
}
bootstrap();
