import { Injectable } from '@nestjs/common';
import poolReturner from 'src/utils/connectionPool';
import { IInsumo } from 'src/dto/pedidoDto';
import { IemailMsg } from 'src/utils/interfaces';
import { MailerService } from '@nestjs-modules/mailer';
import mailer from 'src/utils/mailer';

@Injectable()
export class Pedido {
    constructor(private readonly mailerServ: MailerService) {}
    async postPedido (requester: string, service_id: number, client_id: number, usuario_id: number, insumos: IInsumo[]) {
        try {
            const conn = await poolReturner().getConnection()
            const nro = Math.floor(Math.random() * 100000).toString()
            const sql_pedido = `insert glpi_sgp_orders 
            (state, numero, date_requested, service_id, client_id, user_id, requester )
            values ("Pendiente", ${nro} , NOW(), ${service_id}, ${client_id}, ${usuario_id}, "${requester}" );`
            const sql_data = `select order_id from glpi_sgp_orders where numero = ${nro} and user_id = ${usuario_id};`
            const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4 or gsu.username = '${requester}';`
            const sql_cco = `select gss.service_des from glpi_sgp_services gss where gss.service_id = ${service_id} and gss.client_id = ${client_id};`
            await conn.query(sql_pedido)
            const [rows, fiels] = await conn.query(sql_data)
            const [rows1, fiels1] = await conn.query(sql_emails)
            const [rows2, fiels2] = await conn.query(sql_cco)
            const orderId = rows[0].order_id
            insumos.forEach(async i => {
                await conn.query(`insert glpi_sgp_order_detail (amount, order_id, insumo_des)
                    values (${i.amount}, ${orderId}, "${i.insumo_des}");`)
            });
            conn.release()
            if(rows1.constructor === Array && rows2.constructor === Array) {
                const mail: IemailMsg = {
                    subject: `Nuevo Pedido Solicitado - SGP`,
                    msg: `Pedido numero "${nro}" solcitado por el usuario "${requester}" al centro de costo ${service_id}-${rows2[0]['service_des']}`
                }
                const adresses: string [] = rows1.map(r => r['email']) 
                console.log(adresses)
                await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
            }

            return "Creado"
        } catch (error) {
            throw new Error(error)
        }
    }
    async getAllPedidos () {
        const conn = await poolReturner().getConnection()
        const sql_pedidos = `select * from glpi_sgp_orders;`
        const [rows, fiels] = await conn.query(sql_pedidos)
        const sql_order_details = `select * from glpi_sgp_order_detail;`
        const [rows1, fiels1] = await conn.query(sql_order_details)
        if(rows.constructor === Array && rows1.constructor === Array){
            const completeData = rows.map(o => {
                const details = rows1
                const insumos = details.filter(d => d['order_id'] === o['order_id'])
                o['insumos'] = insumos
                return o
            })
            conn.destroy()
            return completeData
        }
        conn.release()
        throw new Error('Error getting data')
    }
    async aprove (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Aprobado" , 
        date_aproved = NOW() where order_id = ${orId}`
        const conn = await poolReturner().getConnection()
        await conn.query(sql)
        const sql_order = `select gso.date_requested, gso.numero, gso.requester, gsu.email from glpi_sgp_orders gso inner join glpi_sgp_users gsu on gso.user_id = gsu.usuario_id where gso.order_id = ${orId};`
        const [rows, fiels] = await conn.query(sql_order)
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const [rows1, fiels1] = await conn.query(sql_emails)
        if(rows.constructor === Array && rows1.constructor === Array){
            const order = rows[0]
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(order['email'])
            const mail: IemailMsg = {
                subject: `Nuevo Pedido Solicitado - SGP`,
                msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} fue Aprobado.`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        }
        conn.destroy()
        return "Orden "+orId+ " Aprobado."
    }
    async reject (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Rechazado" where order_id = ${orId}`
        const conn = await poolReturner().getConnection()
        await conn.query(sql)
        //Datos para mandar correo
        const sql_order = `select gso.date_requested, gso.numero, gso.requester, gsu.email from glpi_sgp_orders gso inner join glpi_sgp_users gsu on gso.user_id = gsu.usuario_id where gso.order_id = ${orId};`
        const [rows, fiels] = await conn.query(sql_order)
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const [rows1, fiels1] = await conn.query(sql_emails)
        if(rows.constructor === Array && rows1.constructor === Array){
            const order = rows[0]
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(order['email'])
            const mail: IemailMsg = {
                subject: `Nuevo Pedido Solicitado - SGP`,
                msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} fue Rechazado.`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        }
        conn.destroy()
        return "Orden "+orId+ " Rechazado."
    }
    async ready (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Listo" where order_id = ${orId}`
        const conn = await poolReturner().getConnection()
        await conn.query(sql)
        //Datos para mandar correo
        const sql_order = `select gso.date_requested, gso.numero, gso.requester, gsu.email from glpi_sgp_orders gso inner join glpi_sgp_users gsu on gso.user_id = gsu.usuario_id where gso.order_id = ${orId};`
        const [rows, fiels] = await conn.query(sql_order)
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const [rows1, fiels1] = await conn.query(sql_emails)
        if(rows.constructor === Array && rows1.constructor === Array){
            const order = rows[0]
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(order['email'])
            const mail: IemailMsg = {
                subject: `Nuevo Pedido Solicitado - SGP`,
                msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} esta Listo.`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        }
        conn.destroy()
        return "Orden "+orId+ " lista."
    }
    async cancel (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Cancelado" where order_id = ${orId}`
        const conn = await poolReturner().getConnection()
        await conn.query(sql)
        //Datos para mandar correo
        const sql_order = `select gso.date_requested, gso.numero, gso.requester, gsu.email from glpi_sgp_orders gso inner join glpi_sgp_users gsu on gso.user_id = gsu.usuario_id where gso.order_id = ${orId};`
        const [rows, fiels] = await conn.query(sql_order)
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const [rows1, fiels1] = await conn.query(sql_emails)
        if(rows.constructor === Array && rows1.constructor === Array){
            const order = rows[0]
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(order['email'])
            const mail: IemailMsg = {
                subject: `Nuevo Pedido Solicitado - SGP`,
                msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} fue Cancelado.`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        }
        conn.destroy()
        return "Orden "+orId+ " Cancelado."
    }
    async delivered (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Entregado" , 
        date_delivered = NOW() where order_id = ${orId}`
        const conn = await poolReturner().getConnection()
        await conn.query(sql)
        //Datos para mandar correo
        const sql_order = `select gso.date_requested, gso.numero, gso.requester, gsu.email from glpi_sgp_orders gso inner join glpi_sgp_users gsu on gso.user_id = gsu.usuario_id where gso.order_id = ${orId};`
        const [rows, fiels] = await conn.query(sql_order)
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const [rows1, fiels1] = await conn.query(sql_emails)
        if(rows.constructor === Array && rows1.constructor === Array){
            const order = rows[0]
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(order['email'])
            const mail: IemailMsg = {
                subject: `Nuevo Pedido Solicitado - SGP`,
                msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} fue Entregado.`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        }
        conn.destroy()
        return "Orden "+orId+ " Entregado."
    }
    async archive (orId: number) {
        const sql = `update glpi_sgp_orders gso set archive = true where order_id = ${orId}`
        const conn = await poolReturner().getConnection()
        await conn.query(sql)
        conn.destroy()
        return "Orden "+orId+ " Archivado."
    }

}
