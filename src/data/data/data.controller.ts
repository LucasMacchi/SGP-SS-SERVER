import { Body, Controller, Get, 
    Param, 
    Post, UseGuards } from '@nestjs/common';
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
        return 'Mail sent'
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
    @Post('client')
    async getClientPdf (@Body() body: clienteDto) {
        return await this.DataProvider.clientPdf(body.client_id, body.dateStart, body.dateEnd)
    }

    @UseGuards(userGuard)
    @Get('categories')
    async getCategories () {
        return await this.DataProvider.categoriesGetter()
    }

    //@UseGuards(userGuard)
    @Get('reports/:id')
    async getReports (@Param('id') id: string) {
        return await this.DataProvider.reportGetters(id)
    }
}
