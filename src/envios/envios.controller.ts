import { Controller, Get, Param, Body, Patch, UseGuards, Post, Delete } from '@nestjs/common';
import { EnviosService } from './envios.service';
import { editCantidadDto } from 'src/dto/editEnvio';
import { userGuard } from 'src/user/userAuth.guard';
import { createEnvioDto } from 'src/dto/enviosDto';
import editInsumoEnvioDto from 'src/dto/editInsumoEnvioDto';
import editInsumoEnvioPlanDto from 'src/dto/editInsumoEnvioPlanDto';

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
    @Get('pv')
    getCurrentPv() {
        return this.EnviosService.getPv()
    }
    @UseGuards(userGuard)
    @Get('rt')
    getCurrentRt() {
        return this.EnviosService.getLastRt()
    }
    @UseGuards(userGuard)
    @Get('planes')
    getEnviosPlanes() {
        return this.EnviosService.getPlanesEnvios()
    }
    @UseGuards(userGuard)
    @Post('add/plan/:des/:dias')
    addPlanes(@Param('des') des:string,@Param('dias') dias:number) {
        return this.EnviosService.AddPlan(des,dias)
    }
    @UseGuards(userGuard)
    @Patch('plan/edit/insumo')
    patchEnviosPlanes(@Body() data: editInsumoEnvioPlanDto) {
        return this.EnviosService.patchInsumosPlan(data)
    }
    @UseGuards(userGuard)
    @Post('plan/add/insumo/:plan/:ins/:dias')
    addEnviosPlanes(@Param('plan') plan:number,@Param('ins') ins:number,@Param('dias') dias:number) {
        return this.EnviosService.AddInsumosPlan(plan,ins,dias)
    }
    @UseGuards(userGuard)
    @Delete('plan/del/insumo/:id')
    deleteEnviosPlanes(@Param('id') id:number) {
        return this.EnviosService.delInsumosPlan(id)
    }
    @UseGuards(userGuard)
    @Get('entregas')
    getLentregas() {
        return this.EnviosService.getLugaresEntrega()
    }
    @UseGuards(userGuard)
    @Get('insumos')
    getInsumos() {
        return this.EnviosService.getInsumosEnvios()
    }
    @UseGuards(userGuard)
    @Patch('insumos')
    patchInsumos(@Body() data: editInsumoEnvioDto) {
        return this.EnviosService.patchInsumosEnvios(data)
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
    @Get('tanda/:start/:end')
    getAllEnviosTanda(@Param('start') start:string, @Param('end') end:string) {
        return this.EnviosService.getTandaEnvios(start,end)
    }
    @UseGuards(userGuard)
    @Get('remitos/:start/:end')
    getcreateRemitoData(@Param('start') start:string, @Param('end') end:string) {
        return this.EnviosService.createRemitosData(start,end)
    }
    @UseGuards(userGuard)
    @Get('txt/:start/:end/:dias')
    getcreateTxt(@Param('start') start:string, @Param('end') end:string,@Param('dias') dias:number) {
        return this.EnviosService.createTxtEnvio(start,end,dias)
    }
    @UseGuards(userGuard)
    @Get('ruta/:start/:end')
    getcreateRuta(@Param('start') start:string, @Param('end') end:string) {
        return this.EnviosService.getRuta(start,end)
    }
    @UseGuards(userGuard)
    @Get('actas/:start/:end')
    getcreateActas(@Param('start') start:string, @Param('end') end:string) {
        return this.EnviosService.getActasConformidad(start,end)
    }
    @UseGuards(userGuard)
    @Delete("del/tanda/:tanda/:key")
    deleteTandaController(@Param('tanda') tanda:string,@Param('key') key:string) {
        return this.EnviosService.deleteTanda(parseInt(tanda), key)
    }
    @UseGuards(userGuard)
    @Get('informe/:fecha')
    getcreateInforme(@Param('fecha') fecha:string) {
        return this.EnviosService.getInformeFecha(fecha)
    }

}
