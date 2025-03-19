import { Module } from '@nestjs/common';
import { PedidoController } from './pedido/pedido.controller';

@Module({
  controllers: [PedidoController]
})
export class PedidoModule {}
