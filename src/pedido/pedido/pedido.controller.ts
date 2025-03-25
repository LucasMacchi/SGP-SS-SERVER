import { Controller, Get, Patch, Post, Param, Body, UnauthorizedException, UseGuards, Req } from '@nestjs/common';
import pedidoDto from 'src/dto/pedidoDto';
import { Pedido } from '../pedido';
import { userGuard } from 'src/user/userAuth.guard';

@Controller('pedido')
export class PedidoController {
    constructor(private pedido: Pedido) {}
    @UseGuards(userGuard)
    @Get('all')
    async getAllPedidos () {
        return await this.pedido.getAllPedidos()
    }
    @UseGuards(userGuard)
    @Post('add')
    async addPedido (@Body() body : pedidoDto) {
        return await this.pedido.postPedido(body.requester, body.service_id, body.client_id, body.usuario_id, body.insumos)
    }
    @UseGuards(userGuard)
    @Patch('delivered/:id')
    async deliveredSt (@Param('id') id: string) {
        return await this.pedido.delivered(parseInt(id))
    }
    @UseGuards(userGuard)
    @Patch('cancel/:id')
    async cancelSt (@Param('id') id: string) {
        return await this.pedido.cancel(parseInt(id))

    }
    @UseGuards(userGuard)
    @Patch ('aprove/:id')
    async aproveSt (@Param('id') id: string, @Req() rq: Request) {
        if(rq['user']['rol'] === 2 || rq['user']['rol'] === 1) return await this.pedido.aprove(parseInt(id))
        else throw new UnauthorizedException()
    }
    @UseGuards(userGuard)
    @Patch ('reject/:id')
    async rejectSt (@Param('id') id: string, @Req() rq: Request) {
        if(rq['user']['rol'] === 2 || rq['user']['rol'] === 1) return await this.pedido.reject(parseInt(id))
        else throw new UnauthorizedException()
    }
    @UseGuards(userGuard)
    @Patch ('archive/:id') 
    async archive (@Param('id') id: string, @Req() rq: Request) {
        if(rq['user']['rol'] === 2 || rq['user']['rol'] === 1) return await this.pedido.archive(parseInt(id))
        else throw new UnauthorizedException()
    }

}
