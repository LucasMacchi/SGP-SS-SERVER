import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataModule } from './data/data.module';
import { UserModule } from './user/user.module';
import { PedidoModule } from './pedido/pedido.module';

@Module({
  imports: [DataModule, UserModule, PedidoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
