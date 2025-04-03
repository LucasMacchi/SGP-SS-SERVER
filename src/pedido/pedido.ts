import { Injectable } from '@nestjs/common';
import { IInsumo } from 'src/dto/pedidoDto';
import { IDetailChange, IemailMsg } from 'src/utils/interfaces';
import { MailerService } from '@nestjs-modules/mailer';
import mailer from 'src/utils/mailer';
import clientReturner from 'src/utils/clientReturner';
@Injectable()
export class Pedido {
    constructor(private readonly mailerServ: MailerService) {}
    async postPedido (requester: string, service_id: number, client_id: number, usuario_id: number, insumos: IInsumo[]) {
        try {
            const conn = clientReturner()
            await conn.connect()
            const nro = Math.floor(Math.random() * 100000).toString()
            const sql_user_data = `select gsu.email, gsu.first_name, gsu.last_name from  glpi_sgp_users gsu where gsu.usuario_id = ${usuario_id};`
            const rowsU = (await conn.query(sql_user_data)).rows
            const sql_pedido = `insert into glpi_sgp_orders (state, numero, date_requested, service_id, client_id, user_id, requester, archive, first_name, last_name, email ) values ('Pendiente', ${nro} , NOW(), ${service_id}, ${client_id}, ${usuario_id}, '${requester}', false, '${rowsU[0]['first_name']}', '${rowsU[0]['last_name']}', '${rowsU[0]['email']}' );`
            const sql_data = `select gso.order_id, gso.requester, gso.service_id, gss.service_des, gso.numero from glpi_sgp_orders gso join glpi_sgp_services gss on gso.service_id = gss.service_id where numero = '${nro}';`
            const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4 or gsu.username = '${requester}';`
            await conn.query(sql_pedido)
            const rows= (await conn.query(sql_data)).rows
            const rows1 = (await conn.query(sql_emails)).rows
            const orderId = rows[0].order_id
            console.log('Insumos a agregar: ',insumos)
            
            insumos.forEach(async i => {
                await conn.query(`insert into glpi_sgp_order_detail (amount, order_id, insumo_des) values (${i.amount}, ${orderId}, '${i.insumo_des}');`)
            });
            
            
            if(rows1.constructor === Array) {
                const mail: IemailMsg = {
                    subject: `Nuevo Pedido Solicitado - SGP`,
                    msg: `Pedido numero "${nro}" solcitado por el usuario "${requester}" al centro de costo ${service_id}-${rows[0]['service_des']}`
                }
                const adresses: string [] = rows1.map(r => r['email']) 
                console.log(adresses)
                await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
            }
            await conn.end()
            return "Creado"
        } catch (error) {
            throw new Error(error)
        }
    }
    async getAllPedidos () {
        const conn = clientReturner()
        await conn.connect()
        const sql_pedidos = `select * from glpi_sgp_orders where archive = false;`
        const rows = (await conn.query(sql_pedidos)).rows
        const sql_order_details = `select * from glpi_sgp_order_detail;`
        const rows1 = (await conn.query(sql_order_details)).rows
        if(rows.constructor === Array && rows1.constructor === Array){
            const completeData = rows.map(o => {
                const details = rows1
                const insumos = details.filter(d => d['order_id'] === o['order_id'])
                o['insumos'] = insumos
                return o
            })
            await conn.end()
            return completeData
        }
        await conn.end()
        throw new Error('Error getting data')
    }
    async aprove (orId: number, details: number[], commnet: string, change: IDetailChange[]) {
        const sql = `update glpi_sgp_orders gso set state = 'Aprobado' ,date_aproved = NOW() where order_id = ${orId}`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        const sql_order = `select gso.date_requested, gso.numero, gso.requester, gsu.email from glpi_sgp_orders gso inner join glpi_sgp_users gsu on gso.user_id = gsu.usuario_id where gso.order_id = ${orId};`
        const rows = (await conn.query(sql_order)).rows
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const rows1 = (await conn.query(sql_emails)).rows
        details.forEach( async (de) => {
            const slq_delete = `delete from glpi_sgp_order_detail where glpi_sgp_order_detail.detail_id = ${de};`
            await conn.query(slq_delete)
        });
        change.forEach(async (o) => {
            const update_order_sql = `update glpi_sgp_order_detail gsod set amount = ${o.amount} where gsod.detail_id = ${o.detail_id};`
            await conn.query(update_order_sql)
        })
        if(rows.constructor === Array && rows1.constructor === Array){
            const order = rows[0]
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(order['email'])
            const mail: IemailMsg = {
                subject: `Pedido numero ${order['numero']} Aprobado - SGP`,
                msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} fue Aprobado. Algunos productos pudieron no ser aprobados.\n-----------Comentarios-----------------\n${commnet}`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        }
        await conn.end()
        return "Orden "+orId+ " Aprobado."
    }
    async reject (orId: number, commnet: string) {
        const sql = `update glpi_sgp_orders gso set state = 'Rechazado' where order_id = ${orId}`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        //Datos para mandar correo
        const sql_order = `select gso.date_requested, gso.numero, gso.requester, gsu.email from glpi_sgp_orders gso inner join glpi_sgp_users gsu on gso.user_id = gsu.usuario_id where gso.order_id = ${orId};`
        const rows = (await conn.query(sql_order)).rows
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const rows1 = (await conn.query(sql_emails)).rows
        if(rows.constructor === Array && rows1.constructor === Array){
            const order = rows[0]
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(order['email'])
            const mail: IemailMsg = {
                subject: `Pedido numero ${order['numero']} Rechazado - SGP`,
                msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} fue Rechazado. \n-----------Comentarios-----------------\n${commnet}`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        }
        await conn.end()
        return "Orden "+orId+ " Rechazado."
    }
    async ready (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = 'Listo' where order_id = ${orId}`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        //Datos para mandar correo
        const sql_order = `select gso.date_requested, gso.numero, gso.requester, gsu.email from glpi_sgp_orders gso inner join glpi_sgp_users gsu on gso.user_id = gsu.usuario_id where gso.order_id = ${orId};`
        const rows = (await conn.query(sql_order)).rows
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const rows1 = (await conn.query(sql_emails)).rows
        if(rows.constructor === Array && rows1.constructor === Array){
            const order = rows[0]
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(order['email'])
            const mail: IemailMsg = {
                subject: `Pedido numero ${order['numero']} Listo - SGP`,
                msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} esta Listo.`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        }
        await conn.end()
        return "Orden "+orId+ " lista."
    }
    async problem (orId: number, commnet: string) {
        const sql = `update glpi_sgp_orders gso set state = 'Problemas' where order_id = ${orId}`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        //Datos para mandar correo
        const sql_order = `select gso.date_requested, gso.numero, gso.requester, gsu.email from glpi_sgp_orders gso inner join glpi_sgp_users gsu on gso.user_id = gsu.usuario_id where gso.order_id = ${orId};`
        const rows = (await conn.query(sql_order)).rows
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const rows1 = (await conn.query(sql_emails)).rows
        if(rows.constructor === Array && rows1.constructor === Array){
            const order = rows[0]
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(order['email'])
            const mail: IemailMsg = {
                subject: `Pedido numero ${order['numero']} Listo - SGP`,
                msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} informa un problema para la entrega. \n-----------Comentarios-----------------\n${commnet}`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        }
        await conn.end()
        return "Orden "+orId+ " lista."
    }
    async cancel (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = 'Cancelado' where order_id = ${orId};`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        //Datos para mandar correo
        const sql_order = `select gso.date_requested, gso.numero, gso.requester, gsu.email from glpi_sgp_orders gso inner join glpi_sgp_users gsu on gso.user_id = gsu.usuario_id where gso.order_id = ${orId};`
        const rows = (await conn.query(sql_order)).rows
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const rows1 = (await conn.query(sql_emails)).rows
        if(rows.constructor === Array && rows1.constructor === Array){
            const order = rows[0]
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(order['email'])
            const mail: IemailMsg = {
                subject: `Pedido numero ${order['numero']} Cancelado - SGP`,
                msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} fue Cancelado.`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        }
        await conn.end()
        return "Orden "+orId+ " Cancelado."
    }
    async delivered (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = 'Entregado', date_delivered = NOW() where order_id = ${orId}`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        //Datos para mandar correo
        const sql_order = `select gso.date_requested, gso.numero, gso.requester, gsu.email from glpi_sgp_orders gso inner join glpi_sgp_users gsu on gso.user_id = gsu.usuario_id where gso.order_id = ${orId};`
        const rows = (await conn.query(sql_order)).rows
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const rows1 = (await conn.query(sql_emails)).rows
        if(rows.constructor === Array && rows1.constructor === Array){
            const order = rows[0]
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(order['email'])
            const mail: IemailMsg = {
                subject: `Pedido numero ${order['numero']} Entregado - SGP`,
                msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} fue Entregado.`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        }
        await conn.end()
        return "Orden "+orId+ " Entregado."
    }
    async archive (orId: number) {
        const sql = `update glpi_sgp_orders gso set archive = true where order_id = ${orId}`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        await conn.end()
        return "Orden "+orId+ " Archivado."
    }

}
