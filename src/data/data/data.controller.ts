import { Body, Controller, Get, 
    Req, UseGuards } from '@nestjs/common';
import { userGuard } from 'src/user/userAuth.guard';
import { DataProvider } from '../data';
import clienteDto from 'src/dto/clienteDto';

@Controller('data')
export class DataController {
    constructor(private DataProvider: DataProvider) {}

    @Get('ping')
    ping(): string {
        return "Server pinged at "+ new Date()
    }
    @Get('email')
    async emailTest() {
        await this.DataProvider.mailerTest()
    }
    @UseGuards(userGuard)
    @Get('cco')
    async getAllCco () {
        return await this.DataProvider.getCcos()
    }

    @UseGuards(userGuard)
    @Get('insumos')
    async getAllIns () {
        return await this.DataProvider.getInsumos()
    }

    @UseGuards(userGuard)
    @Get('client')
    async getClientPdf (@Body() body: clienteDto) {
        return await this.DataProvider.clientPdf(body.client_id, body.dateStart, body.dateEnd)
    }
}
