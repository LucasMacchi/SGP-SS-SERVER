import { Controller, Get } from '@nestjs/common';


@Controller('data')
export class DataController {

    @Get('ping')
    ping(): string {
        return "Server pinged at "+ new Date()
    }

    @Get('cco')
    getAllCco (): string[] {
        return[]
    }

    @Get('insumos')
    getAllIns (): string[] {
        return[]
    }

    @Get('users')
    getAllUsrs (): string[] {
        return[]
    }
    
}
