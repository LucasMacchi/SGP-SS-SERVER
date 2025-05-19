import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import clientReturner from 'src/utils/clientReturner';
import categoriesJSON from './categories.json'
import reportsErrorsJSON from './reports.json'
import reportDto from 'src/dto/reportDto';
import mailer from 'src/utils/mailer';
import { IemailMsg } from 'src/utils/interfaces';
import emailError from 'src/utils/emailError';

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
    //trae todos los legajos
    async getLegajos (sector: string) {
      const conn = clientReturner()
      await conn.connect()
      const sql = `select * from glpi_sgp_personal where sector = '${sector}';`
      const rows = (await conn.query(sql)).rows
      conn.end()
      return rows
    }
    async getPersonal (id: number) {
      const conn = clientReturner()
      await conn.connect()
      const sql = `select * from glpi_sgp_personal where legajo = '${id}';`
      const rows = (await conn.query(sql)).rows[0]
      conn.end()
      return rows
    }
    //Traer todos los insumos
    async getInsumos () {
        const conn = clientReturner()
        await conn.connect()
        const sql = `select CONCAT(gsi.insumo_id,'-', gsi.ins_cod1,'-', gsi.ins_cod2,'-', gsi.ins_cod3,'-', gsi.descripcion) insumo from glpi_sgp_insumos gsi ;`
        const rows = (await conn.query(sql)).rows
        conn.end()
        return rows
    }
    //Traer todos los Servicios/centro de costo
    async getCcos () {
        const conn = clientReturner()
        await conn.connect()
        const sql = `select * from glpi_sgp_services gss order by gss.service_id asc;`
        const rows = (await conn.query(sql)).rows
        conn.end()
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
        conn.end()
        return rows
    }
    //Trae todos los reportes
    async reportGetters (id: string) {
        const conn = clientReturner()
        await conn.connect()
        const sql = `select * from glpi_sgp_reports where glpi_sgp_reports.pedido_numero = '${id}';`
        const rows = (await conn.query(sql)).rows
        conn.end()
        return rows
    }
    //Trae todas las categorias para hacer un reporte
    async categoriesGetter () {
        return categoriesJSON
    }
    //Trae todas las categorias para hacer un reporte de errores
    async reportsErrorsCategoriesGetter () {
        return reportsErrorsJSON
    }
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
}
