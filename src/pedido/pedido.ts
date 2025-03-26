import { Injectable } from '@nestjs/common';
import poolReturner from 'src/utils/connectionPool';
import { IInsumo } from 'src/dto/pedidoDto';
import mysql from 'mysql2/promise';

@Injectable()
export class Pedido {
    async postPedido (requester: string, service_id: number, client_id: number, usuario_id: number, insumos: IInsumo[]) {
        try {
            const conn = await poolReturner().getConnection()
            const nro = Math.floor(Math.random() * 100000).toString()
            const sql_pedido = `insert glpi_sgp_orders 
            (state, numero, date_requested, service_id, client_id, user_id, requester )
            values ("Pendiente", ${nro} , NOW(), ${service_id}, ${client_id}, ${usuario_id}, "${requester}" );`
            const sql_data = `select order_id from glpi_sgp_orders where numero = ${nro} and user_id = ${usuario_id};`
            await conn.query(sql_pedido)
            const [rows, fiels] = await conn.query(sql_data)
            const orderId = rows[0].order_id
            insumos.forEach(async i => {
                await conn.query(`insert glpi_sgp_order_detail (amount, order_id, insumo_des)
                    values (${i.amount}, ${orderId}, "${i.insumo_des}");`)
            });
            conn.release()
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
        conn.destroy()
        return "Orden "+orId+ " Aprobado."
    }
    async reject (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Rechazado" where order_id = ${orId}`
        const conn = await poolReturner().getConnection()
        await conn.query(sql)
        conn.destroy()
        return "Orden "+orId+ " Rechazado."
    }
    async ready (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Listo" where order_id = ${orId}`
        const conn = await poolReturner().getConnection()
        await conn.query(sql)
        conn.destroy()
        return "Orden "+orId+ " lista."
    }
    async cancel (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Cancelado" where order_id = ${orId}`
        const conn = await poolReturner().getConnection()
        await conn.query(sql)
        conn.destroy()
        return "Orden "+orId+ " Cancelado."
    }
    async delivered (orId: number) {
        const sql = `update glpi_sgp_orders gso set state = "Entregado" , 
        date_delivered = NOW() where order_id = ${orId}`
        const conn = await poolReturner().getConnection()
        await conn.query(sql)
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
