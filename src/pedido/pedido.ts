import { Injectable } from '@nestjs/common';
import poolReturner from 'src/utils/connectionPool';
import { IInsumo } from 'src/dto/pedidoDto';
@Injectable()
export class Pedido {
    async postPedido (requester: string, service_id: number, client_id: number, user_id: number, insumos: IInsumo[]) {
        try {
            const nro = Math.floor(Math.random() * 100000).toString()
            const sql_pedido = `insert glpi_sgp_orders 
            (state, numero, date_requested, service_id, client_id, user_id, requester )
            values ("Pendiente", ${nro} , NOW(), ${service_id}, ${client_id}, ${user_id}, "${requester}" );`
            const sql_data = `select order_id from glpi_sgp_orders where numero = ${nro} and user_id = ${user_id};`
            await poolReturner().query(sql_pedido)
            const [rows, fiels] = await poolReturner().query(sql_data)
            const orderId = rows[0].order_id
            insumos.forEach(async i => {
                await poolReturner().query(`insert glpi_sgp_order_detail (cod_insumo, amount, order_id, insumo_des)
                    values (${i.cod_insumo}, ${i.amount}, ${orderId}, "${i.insumo_des}");`)
            });
            return "Creado"
        } catch (error) {
            throw new Error(error)
        }
    }
    async getAllPedidos () {
        const sql_pedidos = `select * from glpi_sgp_orders;`
        const [rows, fiels] = await poolReturner().query(sql_pedidos)
        const sql_order_details = `select * from glpi_sgp_order_detail;`
        const [rows1, fiels1] = await poolReturner().query(sql_order_details)
        if(rows.constructor === Array && rows1.constructor === Array){
            const completeData = rows.map(o => {
                const details = rows1
                const insumos = details.filter(d => d['order_id'] === o['order_id'])
                o['insumos'] = insumos
                return o
            })
            return completeData
        }
        throw new Error('Error getting data')
    }
    async aprove (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Aprobado" , 
        date_aproved = NOW() where order_id = ${orId}`
        await poolReturner().query(sql)
        return "Orden "+orId+ " Aprobado."
    }
    async reject (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Rechazado" where order_id = ${orId}`
        await poolReturner().query(sql)
        return "Orden "+orId+ " Rechazado."
    }
    async cancel (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Cancelado" where order_id = ${orId}`
        await poolReturner().query(sql)
        return "Orden "+orId+ " Cancelado."
    }
    async delivered (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Entregado" , 
        date_delivered = NOW() where order_id = ${orId}`
        await poolReturner().query(sql)
        return "Orden "+orId+ " Entregado."
    }
    async archive (orId: number) {
        const sql = `update glpi_sgp_orders gso set archive = true where order_id = ${orId}`
        await poolReturner().query(sql)
        return "Orden "+orId+ " Archivado."
    }

}
