import { Controller, Get, Patch, Post, Param } from '@nestjs/common';

@Controller('pedido')
export class PedidoController {
    @Get('all')
    getAllPedidos () {

    }
    @Post('add')
    addPedido () {

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
