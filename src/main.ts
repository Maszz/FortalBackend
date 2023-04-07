import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ForbiddenException,
  VERSION_NEUTRAL,
  VersioningType,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const whitelist = ['http://localhost:3000', 'http://localhost:3333'];
  app.enableCors({
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1 || origin == undefined) {
        console.log(`${origin}` + ' is allowed');
        callback(null, true);
      } else {
        console.log(`${origin} is not allowed`);
        callback(new ForbiddenException('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  console.log(join(__dirname, '..', './public'));
  app.enableVersioning({
    type: VersioningType.HEADER,
    header: 'x-api-version',
    defaultVersion: [VERSION_NEUTRAL, '1'],
  });
  app.useStaticAssets(join(__dirname, '..', './public'));
  const config = new DocumentBuilder()
    .setTitle('REST Endpont Doc')
    .setDescription('All avarable REST endpoints')
    .setVersion('1.0')
    .addTag('api')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT || 8080, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(
    `Application is listening on: ${await app.getHttpServer().address().port}`,
  );
}

bootstrap();
