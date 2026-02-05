import { Injectable } from '@nestjs/common';
import pedidoDto from 'src/dto/pedidoDto';
import { IDetailChange, IemailMsg, IOrderTxt } from 'src/utils/interfaces';
import { MailerService } from '@nestjs-modules/mailer';
import mailer from 'src/utils/mailer';
import clientReturner from 'src/utils/clientReturner';
import reportDto from 'src/dto/reportDto';
import changeProvDto from 'src/dto/changeProvDto';
import filterDto from 'src/dto/filterDto';
import endCode from 'src/utils/endCode';
import mailerResend from 'src/utils/mailerResend';
import { txtOrders, txtOrdersEnt, txtOrdersRange } from 'src/utils/sqlReturner';
import fillEmptyTxt from 'src/utils/fillEmptyTxt';
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
        (amount, order_id, insumo_des,exported)
        VALUES( ${amount}, ${id}, '${insumo}',false);`
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
              await conn.query(`insert into glpi_sgp_order_detail (amount, order_id, insumo_des,exported) values (${i.amount}, ${order_id}, '${i.insumo_des}',false);`)
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
            throw new Error("Error")
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

    //Funcion para rellenar un espacio vacio con ceros
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
    //devuelve la fecha en el formato adecuado para la exportacion
    private dateParser (tDate: Date): string {
        const day = tDate.getUTCDate()
        let dayStr = day.toString()
        const month = tDate.getUTCMonth() + 1
        let mStr = month.toString()
        const year = tDate.getUTCFullYear()
        const yStr = year.toString()
        if(day < 10) dayStr = "0"+dayStr
        if(month < 10) mStr = "0"+mStr
        return year+mStr+dayStr
    }

    async getPedidosTxt (month: number, year: number) {
        const conn = clientReturner()
        const sqlPedidos = txtOrders(month,year)
        const sqlStart = "select payload from glpi_sgp_config where config_id = 3;"
        try {
            await conn.connect()
            const data1: IOrderTxt[] = (await conn.query(sqlPedidos)).rows
            const start = await (await conn.query(sqlStart)).rows[0]["payload"]
            const res = this.createTxt(data1, start,false)
            await conn.end()
            return res.lineas
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getPedidosTxtRange (date1: string,date2:string) {
        const conn = clientReturner()
        const sqlPedidos = txtOrdersRange(date1,date2)
        const sqlStart = "select payload from glpi_sgp_config where config_id = 3;"
        try {
            await conn.connect()
            const data1: IOrderTxt[] = (await conn.query(sqlPedidos)).rows
            for(const detail of data1) {
                await conn.query(`update public.glpi_sgp_order_detail set exported = true where detail_id = ${detail.detail_id};`)
            }
            const start:number = await (await conn.query(sqlStart)).rows[0]["payload"]
            const res = this.createTxt(data1, start,false)
            await conn.query(`update public.glpi_sgp_config set payload = ${res.start} where config_id = 3;`)
            await conn.end()
            return res.lineas
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getPedidosTxtEnt (cods:string[]) {
        const conn = clientReturner()
        let orders = ""
        cods.forEach((c,i) => {
            if(i === 0) orders += `'${c}'`
            else orders += `,'${c}'`
        });
        console.log(orders)
        const sqlPedidos = txtOrdersEnt(orders)
        const sqlStart = "select payload from glpi_sgp_config where config_id = 3;"
        try {
            await conn.connect()
            const data1: IOrderTxt[] = (await conn.query(sqlPedidos)).rows
            const start = await (await conn.query(sqlStart)).rows[0]["payload"]
            const res = this.createTxt(data1, start,true)
            await conn.end()
            return res.lineas
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    private returnProdCods = (prod: string): string => {
        const desP = prod.split("-")
        let cods = ""
        console.log(desP)
        if(desP[0].length > 0) cods +=desP[0]
        if(desP[1].length > 0) cods +="-"+fillEmptyTxt(desP[1],6,false,false,true)
        if(desP[2].length > 0) cods +="-"+fillEmptyTxt(desP[2],6,false,false,true)
        if(desP[3].length > 0) cods +="-"+fillEmptyTxt(desP[3],4,false,false,true)
        return cods
    }

    private createTxt (datos: IOrderTxt[], start: number,entrada: boolean) {
        let lineas: string [] = []
        const blank1 = [4,4,4,25,4,1]
        const blank2 = [26,3,4,25,4,25,6,40,15,15,15,20,50]
        start++
        let aux = datos[0].service_id
        for (let index = 0; index < datos.length; index++) {
            let line = ""
            const p = datos[index]
            if(aux !== p.service_id){
                aux = p.service_id
                start++
            }
            const fecha = entrada ? this.dateParser(new Date()) : this.dateParser(p.date_delivered)
            const desP = p.insumo_des.split("-")
            const cod = this.returnProdCods(p.insumo_des)
            //Comprbante
            line += fillEmptyTxt(entrada ? "ENT" : "SAL",3,false,true,false)
            //Letra
            line += fillEmptyTxt("",1,true,true,false)
            //PV
            line += fillEmptyTxt("",5,true,true,false)
            //Nro comprobante
            line += fillEmptyTxt(start.toString(),8,false,false,true)
            //fecha comprobante
            line += fillEmptyTxt(fecha,8,false,true,false)
            //7 - 12
            blank1.forEach((s) => {
                line += fillEmptyTxt("",s,true,true,false)    
            });
            //Codigo de insumo
            line += fillEmptyTxt(cod,23,false,true,false)
            //cant unidad 1
            line += fillEmptyTxt("-"+p.amount.toString(),16,false,true,false)
            //cant unidad 2
            line += fillEmptyTxt("0.00",16,false,true,false)
            //des articulo
            line += fillEmptyTxt("",50,true,true,false)
            //Tipo de articulo
            line += fillEmptyTxt("8",1,false,false,false)
            //prc costo total mod local
            line += fillEmptyTxt("0.00",16,false,true,false)
            //prc costo total mod ex
            line += fillEmptyTxt("0.00",16,false,true,false)
            //deposito
            line += fillEmptyTxt("CEN",3,false,false,false)
            //22 - 33
            blank2.forEach((s) => {
                line += fillEmptyTxt("",s,true,true,false)    
            });
            //Fecha de partida
            line += fillEmptyTxt(fecha,8,false,true,false)
            //Obs de la partida
            line += fillEmptyTxt("",20,false,false,false)
            //otros datos de la partida
            line += fillEmptyTxt(p.numero,50,false,true,false)
            //CCO
            line += fillEmptyTxt(p.service_id.toString(),7,false,false,true)
            lineas.push(line)
        }
        return {lineas, start: start}
    }

}
