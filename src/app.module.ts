import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { UserModule } from './user/user.module';
import { PedidoModule } from './pedido/pedido.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ThrottlerModule } from '@nestjs/throttler';
import { ComprasModule } from './compras/compras.module';
import dotenv from 'dotenv'; 
dotenv.config();

@Module({
  imports: [DataModule, UserModule, PedidoModule,ComprasModule, MailerModule.forRoot({
    transport: {
      host: process.env.EMAIL_HOST ?? 'NaN',
      port: process.env.EMAIL_HOST_PORT ? parseInt(process.env.EMAIL_HOST_PORT): 465,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME ?? 'NaN',
        pass: process.env.EMAIL_PASSWORD ?? 'NaN'
      },
      tls: { rejectUnauthorized: false }
    }
  }),
  ThrottlerModule.forRoot({
    throttlers:[
      {
        ttl: 30,
        limit: 5
      }
    ]
  })
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
