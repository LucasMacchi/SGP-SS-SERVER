import { Injectable } from '@nestjs/common';
import poolReturner from 'src/utils/connectionPool';
import { IInsumo } from 'src/dto/pedidoDto';
@Injectable()
export class Pedido {
    async postPedido ( service_id: number, client_id: number, user_id: number, insumos: IInsumo[]) {
        const nro = Math.floor(Math.random() * 100000).toString()
        const sql_pedido = `insert glpi_sgp_orders 
        (state, numero, date_requested, service_id, client_id, user_id )
        values ("Pendiente", ${nro} , NOW(), ${service_id}, ${client_id}, ${user_id} );`
        const sql_data = `select order_id from glpi_sgp_orders where numero = ${nro} and user_id = ${user_id};`
        await poolReturner().query(sql_pedido)
        const [rows, fiels] = await poolReturner().query(sql_data)
        console.log(rows)
        return "Creado"

    }
}
