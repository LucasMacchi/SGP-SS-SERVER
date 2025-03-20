import { Injectable } from '@nestjs/common';
import poolReturner from 'src/utils/connectionPool';

@Injectable()
export class DataProvider {
    //Connection
    private readonly pool = poolReturner()
    //Traer todos los insumos
    async getInsumos () {
        const sql = `select CONCAT(gsi.insumo_id,'-', gsi.ins_cod1,'-', gsi.ins_cod2,'-', gsi.ins_cod3, gsi.descripcion) insumo from glpi_sgp_insumos gsi ;`
        const [rows, fiels] = await this.pool.query(sql)
        return rows
    }
    //Traer todos los Servicios/centro de costo
    async getCcos () {
        const sql = `select * from glpi_sgp_services gss;`
        const [rows, fiels] = await this.pool.query(sql)
        return rows
    }
}
