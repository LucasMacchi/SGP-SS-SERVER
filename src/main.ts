import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';
import { json } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe)
  app.use(morgan('dev'))
  app.enableCors('*')
  app.use(json({limit: '50mb'}));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
