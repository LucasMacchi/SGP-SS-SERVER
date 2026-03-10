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
    @Get("vehiculos")
    getVehiculos () {
        return this.FumigacionService.getVeh()
    }

    @UseGuards(userGuard)
    @Patch("serviciofumi/:id/:user/:veh/:talo")
    realizarServicio (@Param('id') id:string,@Param('user') user:string,@Param('veh') veh:string,@Param('talo') talo:string) {
        return this.FumigacionService.realizarServicio(id,user,veh,talo,false)
    }

    @UseGuards(userGuard)
    @Patch("serviciotq/:id/:user/:veh/:talo")
    realizarServicioTq (@Param('id') id:string,@Param('user') user:string,@Param('veh') veh:string,@Param('talo') talo:string) {
        return this.FumigacionService.realizarServicio(id,user,veh,talo,true)
    }
}
