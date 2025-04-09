import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { UserModule } from './user/user.module';
import { PedidoModule } from './pedido/pedido.module';
import { MailerModule } from '@nestjs-modules/mailer';
import dotenv from 'dotenv'; 
dotenv.config();

console.log(process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD)

@Module({
  imports: [DataModule, UserModule, PedidoModule, MailerModule.forRoot({
    transport: {
      host: process.env.EMAIL_HOST ?? 'NaN',
      port: process.env.EMAIL_HOST ? parseInt(process.env.EMAIL_HOST): 465,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME ?? 'NaN',
        pass: process.env.EMAIL_PASSWORD ?? 'NaN'
      },
      tls: { rejectUnauthorized: false }
    }
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
