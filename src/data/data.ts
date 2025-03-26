import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import poolReturner from 'src/utils/connectionPool';

@Injectable()
export class DataProvider {
    constructor(private readonly mailer: MailerService) {}

    //Test de email
    async mailerTest () {
        const msg = "Este correo es de prueba!!"
        await this.mailer.sendMail({
            from: `Lucas Macchi <lucasmacchi2506@zohomail.com>`,
            to: 'lucasmacchi25@gmail.com',
            subject: 'Test Mail from SGP S&S',
            text: msg
        })
    }
    //Traer todos los insumos
    async getInsumos () {
        const conn = await poolReturner().getConnection()
        const sql = `select CONCAT(gsi.insumo_id,'-', gsi.ins_cod1,'-', gsi.ins_cod2,'-', gsi.ins_cod3, gsi.descripcion) insumo from glpi_sgp_insumos gsi ;`
        const [rows, fiels] = await conn.query(sql)
        conn.destroy()
        return rows
    }
    //Traer todos los Servicios/centro de costo
    async getCcos () {
        const conn = await poolReturner().getConnection()
        const sql = `select * from glpi_sgp_services gss;`
        const [rows, fiels] = await conn.query(sql)
        conn.destroy()
        return rows
    }
}
