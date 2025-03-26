import { Injectable } from '@nestjs/common';
import poolReturner from 'src/utils/connectionPool';
import { MailerService } from '@nestjs-modules/mailer';
import { IemailMsg } from 'src/utils/interfaces';
import mailer from 'src/utils/mailer';

@Injectable()
export class UserService {
    constructor(private readonly mailerServ: MailerService) {}

    //Crea un usuario con sql
    async createUser(username: string, first_name: string, last_name: string, 
        rol: number, email:string){
        const conn = await poolReturner().getConnection()
        const slq = `insert into glpi_sgp_users (username, first_name, last_name , rol, date_creation, activated, email ) 
        value ('${username}', '${first_name}', '${last_name}', ${rol}, NOW(), false, '${email}' );`
        await conn.query(slq)
        conn.destroy()
        const mail: IemailMsg = {
            subject: `Usuario ${username} Creado - SGP`,
            msg: `Creacion de usuario '${username}' a nombre de ${last_name} ${first_name} en el dia de la fecha.
            En breve se le activara la cuenta.`
        }
        await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', email,mail.subject, mail.msg))
    }
    //Activa un usuario con sql
    async activateUser (usr: string) {
        const conn = await poolReturner().getConnection()
        const slq = `UPDATE glpi_sgp_users gsu set activated = true , date_activation = NOW() where username = "${usr}";`
        const sql_data = `select * from glpi_sgp_users where username = '${usr}'`
        await conn.query(slq)
        const [rows, fiels] = await conn.query(sql_data)
        conn.destroy()
        const email = rows[0]['email']
        const mail: IemailMsg = {
            subject: `Usuario ${usr} Alta - SGP`,
            msg: `Alta de usuario '${usr}' en el dia de la fecha.`
        }
        await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', email,mail.subject, mail.msg))
    }
    //Desactivar un Usuario con sql
    async deactivateUser (usr: string) {
        const conn = await poolReturner().getConnection()
        const slq = `UPDATE glpi_sgp_users gsu set activated = false , date_deactivation = NOW() where username = "${usr}";`
        const sql_data = `select * from glpi_sgp_users where username = '${usr}'`
        const [rows, fiels] = await conn.query(sql_data)
        await conn.query(slq)
        conn.destroy()
        const email = rows[0]['email']
        const mail: IemailMsg = {
            subject: `Baja de Usuario ${usr} - SGP`,
            msg: `Baja de usuario '${usr}' en el dia de la fecha.`
        }
        await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', email,mail.subject, mail.msg))
    }
    //Traer todos los usuarios por sql
    async getAll () {
        const conn = await poolReturner().getConnection()
        const sql = `select username, first_name, last_name, rol, activated from glpi_sgp_users gsu ;`
        const [rows, fiels] = await conn.query(sql)
        conn.destroy()
        return rows
    }
    //Login
    async login (usr: string) {
        const conn = await poolReturner().getConnection()
        const sql = `select username, rol, first_name, last_name, activated, usuario_id, email from glpi_sgp_users gsu where gsu.username = '${usr}'; ;`
        const [rows, fiels] = await conn.query(sql)
        conn.destroy()
        return rows
    }
}