import { Controller, Get, Param, Body, Patch, UseGuards, Post, Delete, Req } from '@nestjs/common';
import { EnviosService } from './envios.service';
import { editCantidadDto } from 'src/dto/editEnvio';
import { userGuard } from 'src/user/userAuth.guard';
import { createEnvioDto } from 'src/dto/enviosDto';
import editInsumoEnvioDto from 'src/dto/editInsumoEnvioDto';
import editInsumoEnvioPlanDto from 'src/dto/editInsumoEnvioPlanDto';
import { parse } from 'path';
import customRemitosDto from 'src/dto/customRemitosDto';
import addReporteEnvio from 'src/dto/addReporteEnvio';

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
    @Get('fintalo')
    getFinTalonario() {
        return this.EnviosService.getFinTalo()
    }
    @UseGuards(userGuard)
    @Get('rt')
    getCurrentRt() {
        return this.EnviosService.getLastRt()
    }
    @UseGuards(userGuard)
    @Get('cai')
    getCurrentCai() {
        return this.EnviosService.getCai()
    }
    @UseGuards(userGuard)
    @Get('vencimiento')
    getVencimiento() {
        return this.EnviosService.getFechVenc()
    }
    @UseGuards(userGuard)
    @Get('planes')
    getEnviosPlanes() {
        return this.EnviosService.getPlanesEnvios()
    }
    @UseGuards(userGuard)
    @Get('remitos')
    getRemitos() {
        return this.EnviosService.verRemitos()
    }
    @UseGuards(userGuard)
    @Get('reportes/:remito')
    getReportes(@Param('remito') remito:string) {
        return this.EnviosService.verRemitoReportes(remito)
    }
    @UseGuards(userGuard)
    @Post('reportes/create')
    postReportes(@Body() data: addReporteEnvio,@Req() rq: Request) {
        const userId: number = rq['user']['usuario_id']
        return this.EnviosService.createReporte(data,userId)
    }
    @UseGuards(userGuard)
    @Get('lentrega')
    getLentregasRaw() {
        return this.EnviosService.getLugaresDeEntrega()
    }
    @UseGuards(userGuard)
    @Patch('remitos/estado/:estado/:remito/:date')
    patchRemitos(@Param('estado') estado:string,@Param('remito') remito:string,@Param('date') date:string,@Req() rq: Request) {
        const userId: number = rq['user']['usuario_id']
        return date.length > 4 ? this.EnviosService.patchRemitos(estado,remito,userId,date) : this.EnviosService.patchRemitos(estado,remito,userId)
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
    @Get('entregas/:departamento/:plan')
    getLentregas(@Param('departamento') departamento:string,@Param('plan') plan:string) {
        return this.EnviosService.getLugaresEntrega(departamento,parseInt(plan))
    }
    @UseGuards(userGuard)
    @Get('departamentos')
    getDeps() {
        return this.EnviosService.getDepartamentos()
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
    @UseGuards(userGuard)
    @Patch('edit/data/:id/:payload')
    editDataEnv(@Param('id') id:string, @Param('payload') payload:string) {
        return this.EnviosService.updateData(parseInt(payload),parseInt(id))
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
    @Post('/custom/tanda')
    getAllEnviosTandaCustom(@Body() remitos: customRemitosDto) {
        return this.EnviosService.getTandaEnviosCustom(remitos.remitos)
    }
    @UseGuards(userGuard)
    @Get('remitos/:start/:end')
    getcreateRemitoData(@Param('start') start:string, @Param('end') end:string) {
        return this.EnviosService.createRemitosData(start,end)
    }
    @UseGuards(userGuard)
    @Post('custom/remitos')
    getcreateRemitoDataCustom(@Body() remitos: customRemitosDto) {
        return this.EnviosService.createRemitosDataCustom(remitos.remitos)
    }
    @UseGuards(userGuard)
    @Get('txt/:start/:end')
    getcreateTxt(@Param('start') start:string, @Param('end') end:string) {
        return this.EnviosService.createTxtEnvio(start,end)
    }
    @UseGuards(userGuard)
    @Get('ruta/:start/:end')
    getcreateRuta(@Param('start') start:string, @Param('end') end:string) {
        return this.EnviosService.getRuta(start,end)
    }
    @UseGuards(userGuard)
    @Post('custom/ruta')
    getcreateRutaCustom(@Body() remitos: customRemitosDto) {
        return this.EnviosService.getRutaCustom(remitos.remitos)
    }
    @UseGuards(userGuard)
    @Get('actas/:start/:end')
    getcreateActas(@Param('start') start:string, @Param('end') end:string) {
        return this.EnviosService.getActasConformidad(start,end)
    }
    @UseGuards(userGuard)
    @Post('custom/actas')
    getcreateActasCustom(@Body() remitos: customRemitosDto) {
        return this.EnviosService.getActasConformidadCustom(remitos.remitos)
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
