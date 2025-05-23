import { Body, Controller, Get, 
    Param, 
    Post, UseGuards, Delete } from '@nestjs/common';
import { userGuard } from 'src/user/userAuth.guard';
import { DataProvider } from '../data';
import clienteDto from 'src/dto/clienteDto';
import reportDto from 'src/dto/reportDto';
import personalDto from 'src/dto/personalDto';
import { parse } from 'node:path/win32';

@Controller('data')
export class DataController {
    constructor(private DataProvider: DataProvider) {}

    @Get('ping')
    ping(): string {
        return "Server pinged at "+ new Date()
    }
    @Post('personal')
    async postPersonal (@Body() body: personalDto) {
      return await this.DataProvider.createPersonal(body)
    }
    @Delete('personal/:legajo')
    async deletePersonal (@Param('legajo') legajo: string) {
      return await this.DataProvider.deletePersonal(parseInt(legajo))
    }
    @Get('legajos/:sector')
    async getLegajos(@Param('sector') sector: string) {
      return await this.DataProvider.getLegajos(sector)
    }
    @Get('legajo/:id')
    async getPersona(@Param('id') id: string) {
      return await this.DataProvider.getPersonal(parseInt(id))
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
/*
    @UseGuards(userGuard)
    @Get('insumos/:cat/:rub')
    async getAllIns 
    (@Param('cat') cat: string, @Param('rub') rub: string) {
        return await this.DataProvider.getInsumos(cat, rub)
    }
        */
    @UseGuards(userGuard)
    @Get('insumos')
    async getAllIns 
    () {
        return await this.DataProvider.getInsumos()
    }

    @UseGuards(userGuard)
    @Post('client')
    async getClientPdf (@Body() body: clienteDto) {
        return await this.DataProvider.clientPdf(body.client_id, body.dateStart, body.dateEnd,body.user_id)
    }

    @UseGuards(userGuard)
    @Get('categories')
    async getCategories () {
        return await this.DataProvider.categoriesGetter()
    }

    @UseGuards(userGuard)
    @Get('reports/:id')
    async getReports (@Param('id') id: string) {
        return await this.DataProvider.reportGetters(id)
    }
    @UseGuards(userGuard)
    @Get('errors')
    async getErrorsCategories () {
        return await this.DataProvider.reportsErrorsCategoriesGetter()
    }
    @UseGuards(userGuard)
    @Post('errors')
    async createErrorEmail (@Body() body: reportDto) {
        return await this.DataProvider.emailer(body)
    }
    @UseGuards(userGuard)
    @Get('categories/insumos')
    async getInsumosCategories () {
        return await this.DataProvider.getInsCategories()
    }
}
