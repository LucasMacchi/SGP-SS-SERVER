import { Controller, Get, 
    Req, UseGuards } from '@nestjs/common';
import { userGuard } from 'src/user/userAuth.guard';
import { DataProvider } from '../data';
@Controller('data')
export class DataController {
    constructor(private DataProvider: DataProvider) {}

    @Get('ping')
    ping(): string {
        return "Server pinged at "+ new Date()
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
}
