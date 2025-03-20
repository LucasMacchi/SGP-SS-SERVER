import { Module } from '@nestjs/common';
import { PedidoController } from './pedido/pedido.controller';
import { Pedido } from './pedido';

@Module({
  controllers: [PedidoController],
  providers: [Pedido]
})
export class PedidoModule {}
