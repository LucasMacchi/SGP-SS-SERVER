import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { userGuard } from 'src/user/userAuth.guard';
import compraDto from 'src/dto/compraDto';
import { addDetailDto, commentCompra, editCompraCant, editCompraDes } from 'src/dto/editCompraDto';

@Controller('compras')
export class ComprasController {

    constructor(private ComprasService: ComprasService){}

    @Get('ping')
    ping(): string {
        return "Server pinged at "+ new Date()
    }

    @UseGuards(userGuard)
    @Get('areas')
    getAreas() {
        return this.ComprasService.getAreas()
    }


    @UseGuards(userGuard)
    @Get('viajes')
    getViajes() {
        return this.ComprasService.getViajesLogistica()
    }

    @UseGuards(userGuard)
    @Post('registrar')
    createCompra (@Body() data: compraDto) {
        return this.ComprasService.registerCompra(data)
    }

    @UseGuards(userGuard)
    @Patch('aprove/:id')
    aproveCompra (@Param('id') id:string, @Body() data: commentCompra) {
        return this.ComprasService.aproveCompra(parseInt(id),data.comentario)
    }

    @UseGuards(userGuard)
    @Patch('preaprove/:id')
    preaproveCompra (@Param('id') id:string, @Body() data: commentCompra) {
        return this.ComprasService.preAproveCompra(parseInt(id),data.comentario)
    }

    @UseGuards(userGuard)
    @Patch('null/:id')
    anularCompra (@Param('id') id:string,@Body() data: commentCompra) {
        return this.ComprasService.nullCompra(parseInt(id),data.comentario)
    }

    @UseGuards(userGuard)
    @Patch('deactivate/:id')
    desactivarCompra (@Param('id') id:string) {
        return this.ComprasService.deactivateCompra(parseInt(id))
    }

    @UseGuards(userGuard)
    @Get('all')
    allCompras () {
        return this.ComprasService.getAllCompras()
    }

    @UseGuards(userGuard)
    @Get('uniq/:id')
    uniqCompra (@Param('id') id:string) {
        return this.ComprasService.getUniqCompras(parseInt(id))
    }

    @UseGuards(userGuard)
    @Get('uniqbynro/:nro')
    uniqCompraNro (@Param('nro') nro:string) {
        return this.ComprasService.getUniqComprasByNro(nro)
    }

    @UseGuards(userGuard)
    @Patch('edit/des')
    editCompraDes (@Body() data: editCompraDes) {
        return this.ComprasService.editDes(data)
    }

    @UseGuards(userGuard)
    @Patch('edit/cant')
    editCompraCant (@Body() data: editCompraCant) {
        return this.ComprasService.editCantidad(data)
    }

    @UseGuards(userGuard)
    @Get('delete/:id')
    deleteProd (@Param('id') id:string) {
        return this.ComprasService.deleteProd(parseInt(id))
    }
    @UseGuards(userGuard)
    @Post('add')
    addCompraDetail (@Body() data: addDetailDto) {
        return this.ComprasService.addDes(data)
    }

}
