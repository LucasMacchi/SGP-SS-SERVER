import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import pedidoDto from 'src/dto/pedidoDto';
import { Pedido } from '../pedido';

@Controller('pedido')
export class PedidoController {
    constructor(private pedido: Pedido) {}
    @Get('all')
    getAllPedidos () {

    }
    @Post('add')
    async addPedido (@Body() body : pedidoDto) {
        return await this.pedido.postPedido(body.service_id, body.client_id, body.user_id, body.insumos)
    }
    @Patch('delivered/:id')
    deliveredSt (@Param('id') id: string) {
        
    }
    @Patch('cancel/:id')
    cancelSt (@Param('id') id: string) {
        return 'res '+ id
    }
    @Patch ('aprove/:id')
    aproveSt (@Param('id') id: string) {

    }
    @Patch ('reject/:id')
    rejectSt (@Param('id') id: string) {

    }
    @Patch ('archive/:id') 
    archive (@Param('id') id: string) {

    }

}
