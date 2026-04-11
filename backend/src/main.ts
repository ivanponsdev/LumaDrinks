import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cabeceras de seguridad HTTP (XSS, clickjacking, MIME sniffing, etc.)
  app.use(helmet());

  // CORS: en dev acepta cualquier origen; en prod leer de la variable FRONTEND_URL
  const allowedOrigin = process.env.FRONTEND_URL ?? '*';
  app.enableCors({ origin: allowedOrigin });

  // Validación global: rechaza campos extra y datos malformados
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
