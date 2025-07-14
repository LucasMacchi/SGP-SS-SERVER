import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { userGuard } from 'src/user/userAuth.guard';
import compraDto from 'src/dto/compraDto';

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
    @Post('registrar')
    createCompra (@Body() data: compraDto) {
        return this.ComprasService.registerCompra(data)
    }

    @UseGuards(userGuard)
    @Patch('aprove/:id')
    aproveCompra (@Param('id') id:string) {
        return this.ComprasService.aproveCompra(parseInt(id))
    }

    @UseGuards(userGuard)
    @Patch('null/:id')
    anularCompra (@Param('id') id:string) {
        return this.ComprasService.nullCompra(parseInt(id))
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

}
