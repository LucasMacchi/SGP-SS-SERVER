import { Injectable } from '@nestjs/common';
import pedidoDto from 'src/dto/pedidoDto';
import { IDetailChange, IemailMsg } from 'src/utils/interfaces';
import { MailerService } from '@nestjs-modules/mailer';
import mailer from 'src/utils/mailer';
import clientReturner from 'src/utils/clientReturner';
import reportDto from 'src/dto/reportDto';
import changeProvDto from 'src/dto/changeProvDto';
import filterDto from 'src/dto/filterDto';
import endCode from 'src/utils/endCode';
import mailerResend from 'src/utils/mailerResend';
@Injectable()
export class Pedido {
    constructor(private readonly mailerServ: MailerService) {}
    
    //Esta funcion trae un pedido especifico, para ver los detalles del mismo
    async getPedido (id: number) {
        const conn = clientReturner()
        const sql = `SELECT * FROM public.glpi_sgp_orders where order_id  = ${id};`
        await conn.connect()
        const rows = (await conn.query(sql)).rows
        const sql_order_details = `select * from glpi_sgp_order_detail where order_id  = ${id};`
        const rows1 = (await conn.query(sql_order_details)).rows
        rows[0]['insumos'] = rows1
        await conn.end()
        return rows
    }
    //Esta funcion elimina un insumo del array, esto lo hace el encargado de deposito mientra el pedido este pendiente
    async deleteInsumo (detail_id: number) {
        const conn = clientReturner()
        const sql = `DELETE FROM public.glpi_sgp_order_detail WHERE detail_id=${detail_id};`
        await conn.connect()
        await conn.query(sql)
        await conn.end()
        return 'Insumo eliminado'
    }
    //Esta funcion agrega un insumo al array, esto lo hace el encargado de deposito mientra el pedido este pendiente
    async postNewInsumo (id: number, insumo: string, amount: number) {
        const conn = clientReturner()
        const sql =`INSERT INTO public.glpi_sgp_order_detail
        (amount, order_id, insumo_des)
        VALUES( ${amount}, ${id}, '${insumo}');`
        await conn.connect()
        await conn.query(sql)
        await conn.end()
        return 'Insumo agregado'
    }
    //Esto modifica la cantidad de un insumo del array, esto lo hace el encargado de deposito mientra el pedido este pendiente
    async patchAmount (id: number, amount: number) {
      const conn = clientReturner()
      const sql = `UPDATE public.glpi_sgp_order_detail SET amount=${amount} WHERE detail_id=${id};`
      await conn.connect()
      await conn.query(sql)
      await conn.end()
      return 'Cantidad Modificada'
    }
    //Esta funcion crea un pedido, le asigna un numero especifico basado en los datos del pedido y manda un correo informando del pedido.
    async postPedido (pedido: pedidoDto) {
        const conn = clientReturner()
        try {
          console.log(pedido)
            await conn.connect()
            const endC = endCode()
            const clientIdCheck = pedido.client_id >= 1 ? pedido.client_id : 0
            const base = clientIdCheck * 1000 + pedido.usuario_id * 100 + pedido.insumos.length * 10 + (pedido.service_id >= 100000 ? pedido.service_id / 100 : pedido.service_id)
            const factor = parseInt(endC.year) + parseInt(endC.hour) + endC.sec
            const calc = (base + factor)*endC.sec ? Math.floor((base + factor)*endC.sec) : Math.floor(Math.random() * 1000);
            const nro = endC.dayWeek.toString() +calc + endC.month + endC.year;
            let sql_fields = ``
            let sql_values = ``
            sql_fields += `state`
            sql_values += `'Pendiente'`
            sql_fields += `,numero`
            sql_values += `,'${nro}'`
            sql_fields += `,requester`
            sql_values += `,'${pedido.requester}'`
            sql_fields += `,date_requested`
            sql_values += `,NOW()`
            sql_fields += `,service_id`
            sql_values += `,${pedido.service_id}`
            sql_fields += `,client_id`
            sql_values += `,${pedido.client_id}`
            sql_fields += `,user_id`
            sql_values += `,${pedido.usuario_id}`
            sql_fields += `,first_name`
            sql_values += `,'${pedido.first_name}'`
            sql_fields += `,last_name`
            sql_values += `,'${pedido.last_name}'`
            sql_fields += `,email`
            sql_values += `,'${pedido.email}'`
            sql_fields += `,archive`
            sql_values += `,false`
            if(pedido.prov) {
              sql_fields += `,prov,prov_des`
              sql_values += `,${pedido.prov},'${pedido.prov_des}'`
            }
            const sql_pedido = `INSERT INTO public.glpi_sgp_orders (${sql_fields}) values (${sql_values}) RETURNING order_id`
            const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4 or gsu.username = '${pedido.requester}';`
            const order_id = (await conn.query(sql_pedido)).rows[0]['order_id']
            const rows1 = (await conn.query(sql_emails)).rows
            for(const i of pedido.insumos) {
              await conn.query(`insert into glpi_sgp_order_detail (amount, order_id, insumo_des) values (${i.amount}, ${order_id}, '${i.insumo_des}');`)
            }
            if(rows1.constructor === Array) {
                try {
                    //const mail: IemailMsg = {
                    //    subject: `Nuevo Pedido Solicitado - SGP`,
                    //    msg: `Pedido numero "${nro}" solcitado por el usuario "${pedido.requester}" al centro de costo ${pedido.service_id}-${pedido.service_des}`
                    //}
                    //const adresses: string [] = rows1.map(r => r['email']) 
                    //await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
                    await conn.end()
                    return "Creado"
                } catch (error) {
                    await conn.end()
                    return "Creado error en correo"
                }

            }
        } catch (error) {
            await conn.end()
            throw new Error(error)
        }
    }
    
    //Esta funcion trae todos los pedidos que cumplan el filtro.
    async getAllPedidos (filter: filterDto) {
        const limit = filter.limit ? ` LIMIT ${filter.limit}` : ''
        const client = filter.client ? ` and client_id = ${filter.client}` : ''
        const service = filter.service ? ` and service_id = ${filter.service}` : ''
        const numero = filter.numero ? ` and numero = '${filter.numero}'` : ''
        const state = filter.state ? ` and state = '${filter.state}'` : ''
        const dateStart = filter.dateStart ? ` and date_requested >= '${filter.dateStart}'` : ''
        const dateEnd = filter.dateEnd ? ` and date_requested <= '${filter.dateEnd}'` : ''
        const user = filter.user_id ? ` and user_id = ${filter.user_id}` : ''
        const conn = clientReturner()
        await conn.connect()
        const sql_pedidos = `select * from glpi_sgp_orders sgor where archive = false ${client}${service}${numero}${state}${dateStart}${dateEnd}${user} order by sgor.order_id asc ${limit};`
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
    //Esta funcion aprueba el pedido
    async aprove (orId: number, commnet: string) {
        const sql = `update glpi_sgp_orders gso set state = 'Aprobado' ,date_aproved = NOW() where order_id = ${orId}`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        try {
            await conn.end()
            return "Orden "+orId+ " Aprobado."
        } catch (error) {
            await conn.end()
            return "Orden "+orId+ " Aprobado. Correo no enviado"
        }

    }
    //Esta funcion rechaza el pedido
    async reject (orId: number, commnet: string) {
        const sql = `update glpi_sgp_orders gso set state = 'Rechazado' where order_id = ${orId}`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        try {
            await conn.end()
            return "Orden "+orId+ " Rechazado."
        } catch (error) {
            await conn.end()
            return "Orden "+orId+ " Rechazado. Correo no enviado"
        }

    }
    //Esta funcion pone en listo al pedido
    async ready (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = 'Listo' where order_id = ${orId}`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        //Datos para mandar correo
        try {
            await conn.end()
            return "Orden "+orId+ " lista."
        } catch (error) {
            await conn.end()
            return "Orden "+orId+ " lista. Correo no enviado."
        }

    }
    //Esta funcion informa de un problema al pedido
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
        try {
            if(rows.constructor === Array && rows1.constructor === Array){
                const order = rows[0]
                const adresses: string [] = rows1.map(r => r['email'])
                adresses.push(order['email'])
                const mail: IemailMsg = {
                    subject: `Pedido numero ${order['numero']} informa Problemas - SGP`,
                    msg: `Pedido numero "${order['numero']}" solcitado por el usuario "${order['requester']}" en la fecha ${order['date_requested']} informa un problema para la entrega. \n-----------Comentarios-----------------\n${commnet}`
                }
                await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
            }
            await conn.end()
            return "Orden "+orId+ " lista."
        } catch (error) {
            await conn.end()
            return "Orden "+orId+ " lista. Correo no enviado"
        }

    }
    //Esta funcion cancela el pedido
    async cancel (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = 'Cancelado' where order_id = ${orId};`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        try {
            await conn.end()
            return "Orden "+orId+ " Cancelado."
        } catch (error) {
            await conn.end()
            return "Orden "+orId+ " Cancelado. Correo no enviado"
        }
    }
    //Esta funcion entrega el pedido
    async delivered (orId: number, commnet: string) {
        const sql = `update glpi_sgp_orders gso set state = 'Entregado', date_delivered = NOW() where order_id = ${orId}`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        //Datos para mandar correo
        try {
            await conn.end()
            return "Orden "+orId+ " Entregado."
        } catch (error) {
            await conn.end()
            return "Orden "+orId+ " Entregado. Correo no enviado."
        }

    }
    //Esta funcion archiva el pedido
    async archive (orId: number) {
        const sql = `update glpi_sgp_orders gso set archive = true where order_id = ${orId}`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        await conn.end()
        return "Orden "+orId+ " Archivado."
    }
    //Agrega un reporte al pedido
    async addReport (report: reportDto){
        const sql = `INSERT INTO public.glpi_sgp_reports
        (descripcion, order_id, fecha, category, pedido_numero, user_id, fullname)
        VALUES('${report.descripcion}',${report.order_id}, NOW(), '${report.category}', '${report.pedido_numero}', ${report.user_id},'${report.nombre_completo}');`
        const conn = clientReturner()
        await conn.connect()
        await conn.query(sql)
        const sql_emails = `select gsu.email from glpi_sgp_users gsu where gsu.rol = 4;`
        const rows1 = (await conn.query(sql_emails)).rows
        await conn.end()
        try {
            const adresses: string [] = rows1.map(r => r['email'])
            adresses.push(report.email)
            const mail: IemailMsg = {
                subject: `${report.nombre_completo} realizo un reporte - ${report.category} - SGP`,
                msg: `${report.nombre_completo} realizo un reporte para el pedido numero ${report.pedido_numero}:\n${report.descripcion}`
            }
            await mailerResend(adresses,mail.subject, mail.msg)
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', adresses, mail.subject, mail.msg))
        } catch (error) {
            
        }
        return "Reporte creado en pedido numero "+report.pedido_numero
    }
    //Esta funcion asigna un cco al pedido con servicio especial
    async changeProv (id: string, data: changeProvDto) {
        const conn = clientReturner()
        try {
            const sql = `UPDATE public.glpi_sgp_orders SET service_id= ${data.service_id}, client_id= ${data.client_id}, prov=false WHERE order_id= ${id};`
            await conn.connect()
            await conn.query(sql)
            await conn.end()
            return 'Pedido provisional cambiado'
        } catch (error) {
            await conn.end()
            return 'Pedido provisional no cambiado'
        }

    }
    //Esta funcion elimina un pedido, solo admins
    async pedidoDel (id: number) {
        const conn = clientReturner()
        try {
            const sql = `DELETE FROM public.glpi_sgp_orders WHERE order_id=${id};`
            await conn.connect()
            await conn.query(sql)
            await conn.end()
            return 'Pedido eliminado'
        } catch (error) {
            await conn.end()
            return 'Pedido no pudo eliminarse'
        }
    }

}
