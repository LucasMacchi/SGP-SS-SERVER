import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import clientReturner from 'src/utils/clientReturner';
import categoriesJSON from './categories.json'
import reportsErrorsJSON from './reports.json'
import reportDto from 'src/dto/reportDto';
import mailer from 'src/utils/mailer';
import { IemailMsg, IInsumorRes, IOrderRemito } from 'src/utils/interfaces';
import emailError from 'src/utils/emailError';
//import personalDto from 'src/dto/personalDto';
//import collectionOrder from 'src/dto/collectionOrder';
import collectionOrderDto from 'src/dto/collectionOrder';
import blackList from "./blacklist.json"
import { IInsumo } from 'src/dto/pedidoDto';

const supportEmail = process.env.EMAIL_SUPPORT ?? ''

@Injectable()
export class DataProvider {
    constructor(private readonly mailerServ: MailerService) {}

    //Test de email
    async mailerTest () {
        const msg = "Este correo es de prueba!!"
        await this.mailerServ.sendMail({
            from: `Lucas Macchi <gestionpedidos@solucionesyservicios.online>`,
            to: 'lucasmacchi25@gmail.com',
            subject: 'Test Mail from SGP S&S',
            text: msg
        })
    }
    /*
    //trae todos los legajos
    async getLegajos (sector: string) {
      const conn = clientReturner()
      await conn.connect()
      const sql = `select * from glpi_sgp_personal where sector = '${sector}';`
      const rows = (await conn.query(sql)).rows
      await conn.end()
      return rows
    }
    */
    async getInsCategories () {
        const conn = clientReturner()
        await conn.connect()
        const sql = `select gsi.categoria from glpi_sgp_insumos gsi group by categoria;`
        const sql2 = `select gsi.rubro from glpi_sgp_insumos gsi group by gsi.rubro;`
        const rows = (await conn.query(sql)).rows
        const rows2 = (await conn.query(sql2)).rows
        await conn.end()
        const cat = rows.map(c => c['categoria'])
        const rub = rows2.map(c => c['rubro'])
        const data = {
            categorias: cat,
            rubros: rub
        }
        return data
    }
    /*
    async getPersonal (id: number) {
      const conn = clientReturner()
      await conn.connect()
      const sql = `select * from glpi_sgp_personal where legajo = '${id}';`
      const rows = (await conn.query(sql)).rows[0]
      await conn.end()
      return rows
    }
    */
    //Traer todos los insumos
    async getInsumos (rol: number) {
        const conn = clientReturner()
        await conn.connect()
        let sql: string = ''
        if(rol === 5) {
            sql = `select CONCAT(gsi.insumo_id,'-', gsi.ins_cod1,'-', gsi.ins_cod2,'-', gsi.ins_cod3,'-', gsi.descripcion) insumo 
            from glpi_sgp_insumos gsi where gsi.categoria = 'Racionamiento';`
        }
        else{
            sql = `select CONCAT(gsi.insumo_id,'-', gsi.ins_cod1,'-', gsi.ins_cod2,'-', gsi.ins_cod3,'-', gsi.descripcion) insumo from glpi_sgp_insumos gsi;`
        }
        const blackListSet = new Set(blackList.list)
        const rows: IInsumorRes[] = (await conn.query(sql)).rows
        const filteredInsumos: IInsumorRes[] = rows.filter(ins1 => !blackListSet.has(ins1.insumo))
        await conn.end()
        return filteredInsumos
    }
    //Devuelve los insumos pero como objetos completos
    async getInsumosComplete () {
        const conn = clientReturner()
        await conn.connect()
        const sql = "select * from glpi_sgp_insumos g;"
        const rows = (await conn.query(sql)).rows
        await conn.end()
        return rows
    }
    //Traer todos los Servicios/centro de costo
    async getCcos () {
        const conn = clientReturner()
        await conn.connect()
        const sql = `select * from glpi_sgp_services gss order by gss.service_id asc;`
        const rows = (await conn.query(sql)).rows
        await conn.end()
        return rows
    }
    //Traer todos los insumos pedidos por un cliente dentro de un rango de fecha, '20250310' tipo de fecha q acepta
    async clientPdf (client_id: number, dateStart: string, dateEnd: string, user_id: number) {
        const conn = clientReturner()
        await conn.connect()
        let sql = ``
        if(user_id) {
            sql = `select gsod.insumo_des, SUM(gsod.amount) from
            glpi_sgp_orders gso join glpi_sgp_order_detail gsod on gso.order_id = gsod.order_id
            where gso.client_id = ${client_id} and gso.date_requested <= '${dateEnd}' and gso.date_requested >= '${dateStart}' and gso.user_id = ${user_id}
            and NOT gso.state = 'Pendiente' and NOT gso.state = 'Rechazado' and NOT gso.state = 'Cancelado' group by gsod.insumo_des;`
        }
        else {
            sql = `select gsod.insumo_des, SUM(gsod.amount) from
            glpi_sgp_orders gso join glpi_sgp_order_detail gsod on gso.order_id = gsod.order_id
            where gso.client_id = ${client_id} and gso.date_requested <= '${dateEnd}' and gso.date_requested >= '${dateStart}'
            and NOT gso.state = 'Pendiente' and NOT gso.state = 'Rechazado' and NOT gso.state = 'Cancelado' group by gsod.insumo_des;`
        }

        const rows = (await conn.query(sql)).rows
        await conn.end()
        return rows
    }
    //Trae todos los reportes
    async reportGetters (id: string) {
        const conn = clientReturner()
        await conn.connect()
        const sql = `select * from glpi_sgp_reports where glpi_sgp_reports.pedido_numero = '${id}';`
        const rows = (await conn.query(sql)).rows
        await conn.end()
        return rows
    }
    //Trae todas las categorias para hacer un reporte
    async categoriesGetter () {
        return categoriesJSON
    }
    //No en uso
    /*
    async createPersonal (personal: personalDto) {
      const sql = `INSERT INTO public.glpi_sgp_personal
      (legajo, fullname, cuil, sector)
      VALUES(${personal.legajo}, '${personal.fullname}', ${personal.cuil}, '${personal.sector}');`
      const conn = clientReturner()
      await conn.connect()
      await conn.query(sql)
      await conn.end()
      return 'Personal agregado'
    }
    async deletePersonal (id: number) {
      const sql = `DELETE FROM public.glpi_sgp_personal WHERE legajo = ${id};`
      const conn = clientReturner()
      await conn.connect()
      await conn.query(sql)
      await conn.end()
      return 'Personal eliminado'
    }
    */
    //Trae todas las categorias para hacer un reporte de errores
    async reportsErrorsCategoriesGetter () {
        return reportsErrorsJSON
    }
    //Manda un correo en caso de errores
    async emailer (body: reportDto) {
        try {
            const mail: IemailMsg = {
                subject: `${body.category} - SGP`,
                msg: emailError(body.descripcion,body.category,body.nombre_completo)
            }
            console.log(supportEmail)
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', supportEmail,body.category, mail.msg))
        } catch (error) {
            return 'Email fail'
        }
    }
    //Devuelve los pedidos de la coleccion proporcionada para despues imprimirlos
    async collectionOrders (collection: collectionOrderDto){
        let orders = ``
        const conn = clientReturner()
        collection.orders.forEach((o) => {
            if(orders.length === 0){
                orders = orders + `'${o}'`
            }
            else{
                orders = orders + `,'${o}'`
            }
        })
        const sql = `select gsod.insumo_des, SUM(gsod.amount) from
        glpi_sgp_orders gso join glpi_sgp_order_detail gsod on gso.order_id = gsod.order_id
        where gso.numero IN(${orders}) group by gsod.insumo_des;`
        const sql2 = `select gso.numero, gss.service_des, gso.requester from glpi_sgp_orders gso 
        join glpi_sgp_services gss on gso.service_id = gss.service_id where gso.numero in(${orders});`
        await conn.connect()
        const rows2 = (await conn.query(sql2)).rows
        const rows = (await conn.query(sql)).rows
        await conn.end()
        const response = {
            insumos: rows,
            servicios: rows2
        }
        return response
    }
    //Devuelve los pedidos de la coleccion proporcionada para despues imprimirlos en un remito
    async collectionRemito (collection: collectionOrderDto) {
        let orders = ``
        const conn = clientReturner()
        collection.orders.forEach((o) => {
            if(orders.length === 0){
                orders = orders + `'${o}'`
            }
            else{
                orders = orders + `,'${o}'`
            }
        })
        const sql = `select g2.localidad, g2.service_des, g.numero, g2.client_des, g.order_id from glpi_sgp_orders g 
        join glpi_sgp_services g2 on g.service_id = g2.service_id 
        where g.numero in (${orders}) ;`
        await conn.connect()
        const rows: IOrderRemito[] = (await conn.query(sql)).rows
        const newArrs: IOrderRemito[] = []
        for(const i of rows) {
            const rowsIn: IInsumo[] = (await conn.query(`select * from glpi_sgp_order_detail g where g.order_id = ${i.order_id};`)).rows
            if(rowsIn.length > 23) {
                const insumos1 = rowsIn.slice(0,24)
                const insumos2 = rowsIn.slice(24, rowsIn.length)
                newArrs.push({...i, insumos: insumos2})
                i.insumos=insumos1
            }
            else {
                i.insumos = rowsIn
            }       
        }
        const res = rows.concat(newArrs)
        await conn.end()
        return res
    }
}
