import { Controller, Patch, Post, Param, Body, UnauthorizedException, UseGuards, Req, Get, Delete } from '@nestjs/common';
import pedidoDto from 'src/dto/pedidoDto';
import { Pedido } from '../pedido';
import { userGuard } from 'src/user/userAuth.guard';
import aproveDto from 'src/dto/aproveDto';
import rejectDto from 'src/dto/rejectDto';
import reportDto from 'src/dto/reportDto';
import commentDto from 'src/dto/commentDto';
import changeProvDto from 'src/dto/changeProvDto';
import filterDto from 'src/dto/filterDto';
import addInsumo from 'src/dto/addInsumo';

@Controller('pedido')
export class PedidoController {
    constructor(private pedido: Pedido) {}
    @UseGuards(userGuard)
    @Post('all')
    async getAllPedidos (@Body() body : filterDto) {
        return await this.pedido.getAllPedidos(body)
    }
    @Get('detail/:id')
    async getDetails (@Param('id') id:string) {
        return await this.pedido.getPedido(parseInt(id))
    }
    @UseGuards(userGuard)
    @Post('add')
    async addPedido (@Body() body : pedidoDto) {
        return await this.pedido.postPedido(body)
    }
    @UseGuards(userGuard)
    @Post('insumo/:id')
    async insumoAdd (@Param('id') id: string, @Body() body: addInsumo) {
        return await this.pedido.postNewInsumo(parseInt(id), body.insumo, body.cantidad)
    }
    @UseGuards(userGuard)
    @Delete('insumo/:id')
    async deleteInsumoFromOrder (@Param('id') id:string) {
        return await this.pedido.deleteInsumo(parseInt(id))
    }
    @UseGuards(userGuard)
    @Patch('cantidad/:id/:cantidad')
    async changeAmount (@Param('id') id:string, @Param('cantidad') amount:string) {
      return await this.pedido.patchAmount(parseInt(id), parseFloat(amount))
    }
    @UseGuards(userGuard)
    @Patch('provisional/:id')
    async provisionalChange (@Param('id') id: string, @Body() body : changeProvDto) {
        return await this.pedido.changeProv(id, body)
    }
    @UseGuards(userGuard)
    @Patch('delivered/:id')
    async deliveredSt (@Param('id') id: string, @Body() body : commentDto) {
        console.log("AA ",body)
        return await this.pedido.delivered(parseInt(id), body.comment)
    }
    @UseGuards(userGuard)
    @Patch('cancel/:id')
    async cancelSt (@Param('id') id: string) {
        return await this.pedido.cancel(parseInt(id))

    }
    @UseGuards(userGuard)
    @Patch ('aprove/:id')
    async aproveSt (@Param('id') id: string, @Req() rq: Request, @Body() body : aproveDto) {
        if(rq['user']['rol'] === 2 || rq['user']['rol'] === 1 || rq['user']['rol'] === 4) return await this.pedido.aprove(parseInt(id), body.comment)
        else throw new UnauthorizedException()
    }
    @UseGuards(userGuard)
    @Patch ('reject/:id')
    async rejectSt (@Param('id') id: string, @Req() rq: Request, @Body() body : rejectDto) {
        if(rq['user']['rol'] === 2 || rq['user']['rol'] === 1 || rq['user']['rol'] === 4) return await this.pedido.reject(parseInt(id), body.comment)
        else throw new UnauthorizedException()
    }
    @UseGuards(userGuard)
    @Patch ('archive/:id') 
    async archive (@Param('id') id: string, @Req() rq: Request) {
        if(rq['user']['rol'] === 2 || rq['user']['rol'] === 1) return await this.pedido.archive(parseInt(id))
        else throw new UnauthorizedException()
    }
    //@UseGuards(userGuard)
    @Get("txt/:month/:year")
    async getTxt (@Param('month') month: string,@Param('year') year: string) {
        return this.pedido.getPedidosTxt(parseInt(month),parseInt(year))
    }
    @UseGuards(userGuard)
    @Patch('ready/:id')
    async readyOrder (@Param('id') id: string, @Req() rq: Request) {
        if(rq['user']['rol'] === 4 || rq['user']['rol'] === 1) return await this.pedido.ready(parseInt(id))
        else throw new UnauthorizedException()
    }
    @UseGuards(userGuard)
    @Patch ('problem/:id')
    async problemOrder (@Param('id') id: string, @Body() body : commentDto) {
        return await this.pedido.problem(parseInt(id), body.comment)
    }
    @UseGuards(userGuard)
    @Post('report')
    async postReport (@Body() body: reportDto) {
        return await this.pedido.addReport(body)
    }
    @UseGuards(userGuard)
    @Delete('eliminar/:id')
    async deletePedido(@Param('id') id: string) {
        return await this.pedido.pedidoDel(parseInt(id))
    }
    /*
    @UseGuards(userGuard)
    @Get('uniq/:nro')
    async getUniqPedido (@Param('nro') nro: string) {
        return this.pedido.getUnqPedido(nro)
    }
    */
}
