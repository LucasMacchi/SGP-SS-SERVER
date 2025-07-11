import { Injectable } from '@nestjs/common';
import areas from "./areas.json"
import compraDto from 'src/dto/compraDto';

@Injectable()
export class ComprasService {
    
    async getAreas () {
        return areas.areas
    }

    async registerCompra (data: compraDto) {
        return 0
    }

    async getAllCompras () {
        return 0
    }

}
