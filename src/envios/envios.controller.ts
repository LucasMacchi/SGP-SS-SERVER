import { Controller, Get, Param, Body, Patch } from '@nestjs/common';
import { EnviosService } from './envios.service';
import { editCantidadDto } from 'src/dto/editEnvio';

@Controller('envios')
export class EnviosController {
    constructor(private EnviosService: EnviosService){}
    
    @Get('ping')
    ping(): string {
        return "Server pinged at "+ new Date()
    }

    @Get('all')
    getAllEnvios() {
        return this.EnviosService.getEnvios()
    }

    @Get('entregas')
    getLentregas() {
        return this.EnviosService.getLugaresEntrega()
    }

    @Get('desgloses')
    getAllDesgloses() {
        return this.EnviosService.getDesgloses()
    }
    
    @Get('uniq/envio/:id')
    getUniqEnv(@Param('id') id:string) {
        return this.EnviosService.getEnviosUniq(parseInt(id))
    }

    @Patch('edit/cant')
    editCantEnv(@Body() data: editCantidadDto) {
        return this.EnviosService.editCantidad(data)
    }
}
