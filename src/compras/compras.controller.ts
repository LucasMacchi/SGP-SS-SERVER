import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
    @Get('all')
    allCompras () {
        return this.ComprasService.getAllCompras()
    }

}
