import { Injectable } from '@nestjs/common';
import { editCantidadDto } from 'src/dto/editEnvio';
import clientReturner from 'src/utils/clientReturner';
import endCode from 'src/utils/endCode';
import desglosesJson from "./desgloses.json"
import { createEnvioDto } from 'src/dto/enviosDto';

@Injectable()
export class EnviosService {

    async getLugaresEntrega () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = "SELECT * FROM public.glpi_sgp_lentrega;"
            const rows = (await conn.query(sql)).rows
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getDesgloses () {

        //ACA
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = "SELECT * FROM public.glpi_sgp_desglose;"
            const rows = (await conn.query(sql)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getEnvios () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = "SELECT * FROM public.glpi_sgp_envio;"
            const rows = (await conn.query(sql)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getEnviosUniq (id:number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `SELECT * FROM public.glpi_sgp_envio where envio_id = ${id};`
            const rows = (await conn.query(sql)).rows[0]
            const sql2 = `SELECT * FROM public.glpi_sgp_envio_details where envio_id = ${id};`
            const rows2 = (await conn.query(sql2)).rows
            rows['insumos'] = rows2
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async editCantidad (data: editCantidadDto) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `UPDATE public.glpi_sgp_envio_details SET ${data.column}=${data.cantidad} WHERE detail_id=${data.detail_id};`
            await conn.query(sql)
            await conn.end()
            return "Cantidad editada"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
        
    }

    private emptyFill(amount: number, value: number): string {
        let formatted = ""+value
        if(value.toString().length < amount) {
            const diff = amount - formatted.length
            for (let index = 1; index <= diff; index++) {
                formatted = "0"+formatted
            }
        }
        return formatted
    }

    async createEnvios (data: createEnvioDto) {
        const conn = clientReturner()
        try {
            let created = 0
            let prodCreated = 0
            await conn.connect()
            const enviosSorted = data.enviados.sort((a,b) => a.entregaId - b.entregaId)
            let aux = enviosSorted[0].entregaId
            for(const envio of enviosSorted) {
                if(envio.entregaId > aux) {
                    aux = envio.entregaId
                    data.start_remito++
                }
                console.log(envio.entregaId,this.emptyFill(5,data.pv_remito)+"-"+this.emptyFill(6,data.start_remito))
                const sql = `INSERT INTO public.glpi_sgp_envio(
	            lentrega_id, dependencia, exported,fecha_created)
	            VALUES (${envio.entregaId}, '${envio.desglose}', false, NOW()) RETURNING envio_id;`
                const envId = 0//(await conn.query(sql)).rows[0]["envio_id"]
                for (const prod of envio.detalles) {
                    const sql2 = `INSERT INTO public.glpi_sgp_envio_details(
	                envio_id, kilos, cajas, bolsas, raciones, des)
	                VALUES (${envId}, ${prod.kilos}, ${prod.cajas}, ${prod.bolsas}, ${prod.raciones},'${prod.des}');`
                    //await conn.query(sql2)
                    prodCreated++
                }
                created++
            }
            await conn.end()
            return "Envios creados: "+created+ "\nProductos agregados: "+ prodCreated +"\nEnvios no creados por falta de lugar de entrega: "+data.no_lugarentrega+"\nEnvios sin insumos: "+data.no_insumo
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    

}
