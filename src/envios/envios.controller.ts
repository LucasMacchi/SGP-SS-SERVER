import { Controller, Get, Param, Body, Patch, UseGuards, Post } from '@nestjs/common';
import { EnviosService } from './envios.service';
import { editCantidadDto } from 'src/dto/editEnvio';
import { userGuard } from 'src/user/userAuth.guard';
import { createEnvioDto } from 'src/dto/enviosDto';

@Controller('envios')
export class EnviosController {
    constructor(private EnviosService: EnviosService){}
    
    @UseGuards(userGuard)
    @Get('ping')
    ping(): string {
        return "Server pinged at "+ new Date()
    }

    @UseGuards(userGuard)
    @Get('all')
    getAllEnvios() {
        return this.EnviosService.getEnvios()
    }

    @UseGuards(userGuard)
    @Get('entregas')
    getLentregas() {
        return this.EnviosService.getLugaresEntrega()
    }

    @UseGuards(userGuard)
    @Get('desgloses')
    getAllDesgloses() {
        return this.EnviosService.getDesgloses()
    }
    
    @UseGuards(userGuard)
    @Get('uniq/envio/:id')
    getUniqEnv(@Param('id') id:string) {
        return this.EnviosService.getEnviosUniq(parseInt(id))
    }

    @UseGuards(userGuard)
    @Patch('edit/cant')
    editCantEnv(@Body() data: editCantidadDto) {
        return this.EnviosService.editCantidad(data)
    }
    
    @Post('create')
    createEnvio(@Body() data: createEnvioDto) {
        return this.EnviosService.createEnvios(data)
    }
    @UseGuards(userGuard)
    @Get('tanda/:id')
    getAllEnviosTanda(@Param('id') id:number) {
        return this.EnviosService.getTandaEnvios(id)
    }
    @UseGuards(userGuard)
    @Get('txt/:tanda/:dias')
    getcreateTxt(@Param('tanda') tanda:number,@Param('dias') dias:number) {
        return this.EnviosService.createTxtEnvio(tanda,dias)
    }
    @UseGuards(userGuard)
    @Get('ruta/:tanda')
    getcreateRuta(@Param('tanda') tanda:number) {
        return this.EnviosService.getRuta(tanda)
    }
    @UseGuards(userGuard)
    @Get('actas/:tanda')
    getcreateActas(@Param('tanda') tanda:number) {
        return this.EnviosService.getActasConformidad(tanda)
    }
}
