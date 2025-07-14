import { Injectable } from '@nestjs/common';
import areas from "./areas.json"
import compraDto from 'src/dto/compraDto';
import clientReturner from 'src/utils/clientReturner';

@Injectable()
export class ComprasService {
    
    async getAreas () {
        return areas.areas
    }

    async registerCompra (data: compraDto) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql_compra = `INSERT INTO public.glpi_sgp_compras (area, tipo, descripcion, lugar, activado, aprobado, anulado, fullname, proveedor, fecha)
            VALUES('${data.area}', '${data.tipo}', '${data.descripcion}', '${data.lugar}', true, false, false, '${data.fullname}', '${data.proveedor}', NOW()) RETURNING compra_id;`
            const compra_id = (await conn.query(sql_compra)).rows[0]['compra_id']
            for(const i of data.compras) {
                await conn.query(`INSERT INTO public.glpi_sgp_compras_details (descripcion, cantidad, compra_id) VALUES('${i.descripcion}', ${i.cantidad}, ${compra_id});`)
            }
            await conn.end()
            return "Creado compra"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async aproveCompra (id: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `UPDATE public.glpi_sgp_compras SET fecha_aprobado=NOW(), aprobado=true,anulado=false WHERE compra_id=${id};`
            await conn.query(sql)
            await conn.end()
            return "Compra Aprobado"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async nullCompra (id: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `UPDATE public.glpi_sgp_compras SET aprobado=false, anulado=true WHERE compra_id=${id};`
            await conn.query(sql)
            await conn.end()
            return "Compra Anulada"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async deactivateCompra (id: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `UPDATE public.glpi_sgp_compras SET activado=false WHERE compra_id=${id};`
            await conn.query(sql)
            await conn.end()
            return "Compra eliminada"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async getAllCompras () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `select * from glpi_sgp_compras g where g.activado = true;`
            const rows = (await conn.query(sql)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async getUniqCompras (id: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `select * from glpi_sgp_compras g where g.activado = true and g.compra_id = ${id};`
            const sql_insumos = `select * from glpi_sgp_compras_details g where g.compra_id = ${id};`
            const rows = (await conn.query(sql)).rows[0]
            const rows2 = (await conn.query(sql_insumos)).rows
            rows["compras"] = rows2
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

}
