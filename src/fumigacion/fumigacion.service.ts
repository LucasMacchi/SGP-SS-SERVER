import { Injectable } from '@nestjs/common';
import clientReturner from 'src/utils/clientReturner';
import { IFCliente, IFDroga, IFRubro, IFVeh, ITalonario } from 'src/utils/interfaces';
import rubros from './rubro.json'
@Injectable()
export class FumigacionService {

    async getClientes () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sqlClientes = 'SELECT * FROM public.glpi_fum_cliente ORDER BY cliente_id ASC'
            const rows:IFCliente[] = (await conn.query(sqlClientes)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async getTalonarios (id: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `SELECT t.droga,t.talonario_id,t.fecha,t.oficial,t.numero,t.cliente_id,v.patente FROM public.glpi_fum_talonario t LEFT JOIN glpi_fum_veh v ON t.veh_id = v.veh_id WHERE t.cliente_id = $1 ORDER BY numero ASC`
            const rows:ITalonario[] = (await conn.query(sql,[id])).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getVeh () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sqlVeh = 'SELECT * FROM public.glpi_fum_veh ORDER BY veh_id ASC'
            const rows:IFVeh[] = (await conn.query(sqlVeh)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async getRubros () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sqlVeh = 'SELECT * FROM public.glpi_fum_rubro ORDER BY rubro_id ASC'
            const rows:IFRubro[] = (await conn.query(sqlVeh)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async getDrogas () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sqlVeh = 'SELECT * FROM public.glpi_fum_drga ORDER BY droga_id ASC'
            const rows:IFDroga[] = (await conn.query(sqlVeh)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async realizarServicio (id:string,user:string,veh:string,talo:string,of:boolean,droga:string) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sqlServicio = 'UPDATE public.glpi_fum_cliente SET ultimo_serv=$1, prox_serv=$2 WHERE cliente_id = $3;'
            const sqlLog = `INSERT INTO public.glpi_fum_log(user_id, cliente_id,des) VALUES ($1, $2, $3);`
            const sqlTalo = `INSERT INTO public.glpi_fum_talonario(numero, cliente_id, veh_id,usuario_id,oficial,droga) VALUES ($1, $2, $3, $4, $5,$6);`
            const sqlTaloNull = `INSERT INTO public.glpi_fum_talonario(numero, cliente_id,usuario_id,oficial,droga) VALUES ($1, $2, $3, $4,$5);`
            const currentDate = new Date()
            const nextDate = new Date(new Date().setDate(currentDate.getDate() + 30))
            const logDes = `SERVICIO REALIZADO ${currentDate.toISOString()} A ${nextDate} - TALONARIO REALCIONADO: `+talo
            await conn.query(sqlServicio,[currentDate,nextDate,id])
            if(parseInt(veh)) await conn.query(sqlTalo,[talo,id,veh,user,of,droga])
            else await conn.query(sqlTaloNull,[talo,id,user,of,droga])
            await conn.query(sqlLog,[user,id,logDes])
            await conn.end()
            return "TALONARIO CREADO - "+talo
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
}
