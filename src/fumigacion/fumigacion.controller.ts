import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { FumigacionService } from './fumigacion.service';
import { userGuard } from 'src/user/userAuth.guard';

@Controller('fumigacion')
export class FumigacionController {

    constructor(private FumigacionService: FumigacionService){}

    @Get("ping")
    ping(): string {
        return "Server pinged at "+ new Date()
    }

    @UseGuards(userGuard)
    @Get("clientes")
    getClientes () {
        return this.FumigacionService.getClientes()
    }

    @UseGuards(userGuard)
    @Get("talonarios/:id")
    getTalonarios (@Param('id') id:number) {
        return this.FumigacionService.getTalonarios(id)
    }

    @UseGuards(userGuard)
    @Get("rubros")
    getRubros () {
        return this.FumigacionService.getRubros()
    }

    @UseGuards(userGuard)
    @Get("drogas")
    getDrogas () {
        return this.FumigacionService.getDrogas()
    }

    @UseGuards(userGuard)
    @Get("vehiculos")
    getVehiculos () {
        return this.FumigacionService.getVeh()
    }

    @UseGuards(userGuard)
    @Get("servicios")
    getServicios () {
        return this.FumigacionService.getServicios()
    }

    @UseGuards(userGuard)
    @Patch("facturar/:id/:fac")
    facturarTalo (@Param('id') id:string,@Param('fac') fac:string) {
        return this.FumigacionService.facturarTalonario(id,fac)
    }

    @UseGuards(userGuard)
    @Patch("serviciofumi/:id/:user/:veh/:talo/:droga/:fecha")
    realizarServicio (@Param('id') id:string,@Param('user') user:string,@Param('veh') veh:string,@Param('talo') talo:string,@Param('droga') droga:string,@Param('fecha') fecha:string) {
        return this.FumigacionService.realizarServicio(id,user,veh,talo,false,droga,fecha)
    }

    @UseGuards(userGuard)
    @Patch("serviciotq/:id/:user/:veh/:talo/:droga/:fecha")
    realizarServicioTq (@Param('id') id:string,@Param('user') user:string,@Param('veh') veh:string,@Param('talo') talo:string,@Param('droga') droga:string,@Param('fecha') fecha:string) {
        return this.FumigacionService.realizarServicio(id,user,veh,talo,true,droga,fecha)
    }
}
