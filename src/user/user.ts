import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { IemailMsg } from 'src/utils/interfaces';
import mailer from 'src/utils/mailer';
import clientReturner from 'src/utils/clientReturner';

@Injectable()
export class UserService {
    constructor(private readonly mailerServ: MailerService) {}

    //Crea un usuario con sql
    async createUser(username: string, first_name: string, last_name: string, 
        rol: number, email:string){
        const conn = clientReturner()
        await conn.connect()
        const slq = `insert into glpi_sgp_users (username, first_name, last_name , rol, date_creation, activated, email ) 
        values ('${username}', '${first_name}', '${last_name}', ${rol}, NOW(), false, '${email}' );`
        await conn.query(slq)
        conn.end()
        try {
            const mail: IemailMsg = {
                subject: `Usuario ${username} Creado - SGP`,
                msg: `Creacion de usuario '${username}' a nombre de ${last_name} ${first_name} en el dia de la fecha.
                En breve se le activara la cuenta.`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', email,mail.subject, mail.msg))
        } catch (error) {
            return 'Email fail'
        }
    }
    //Activa un usuario con sql
    async activateUser (usr: string) {
        const conn = clientReturner()
        await conn.connect()
        const slq = `UPDATE glpi_sgp_users gsu set activated = true , date_activation = NOW() where username = '${usr}';`
        const sql_data = `select * from glpi_sgp_users where username = '${usr}'`
        await conn.query(slq)
        const rows = (await conn.query(sql_data)).rows
        await conn.end()
        try {
            const email = rows[0]['email']
            const mail: IemailMsg = {
                subject: `Usuario ${usr} Alta - SGP`,
                msg: `Alta de usuario '${usr}' en el dia de la fecha.\nLink: https://sistemagestorpedidos.solucionesyservicios.online/`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', email,mail.subject, mail.msg))
        } catch (error) {
            return 'Email fail'
        }

    }
    //Desactivar un Usuario con sql
    async deactivateUser (usr: string) {
        const conn = clientReturner()
        await conn.connect()
        const slq = `UPDATE glpi_sgp_users gsu set activated = false , date_deactivation = NOW() where username = '${usr}';`
        const sql_data = `select * from glpi_sgp_users where username = '${usr}'`
        const rows = (await conn.query(sql_data)).rows
        await conn.query(slq)
        await conn.end()
        try {
            const email = rows[0]['email']
            const mail: IemailMsg = {
                subject: `Baja de Usuario ${usr} - SGP`,
                msg: `Baja de usuario '${usr}' en el dia de la fecha.`
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', email,mail.subject, mail.msg))
        } catch (error) {
            return 'Email fail'
        }

    }
    //Traer todos los usuarios por sql
    async getAll () {
        const conn = clientReturner()
        await conn.connect()
        const sql = `select username, first_name, last_name, rol, activated, email, usuario_id from glpi_sgp_users gsu ;`
        const rows = (await conn.query(sql)).rows
        await conn.end()
        return rows
    }
    //Login
    async login (usr: string) {
        const conn = clientReturner()
        await conn.connect()
        const sql = `select username, rol, first_name, last_name, activated, usuario_id, email from glpi_sgp_users gsu where gsu.username = '${usr}'; ;`
        const rows = (await conn.query(sql)).rows
        await conn.end()
        return rows
    }
    //Email sender to user
    async emailer (to_send: string, msg: string, sender: string) {
        try {
            const email = to_send
            const mail: IemailMsg = {
                subject: `Mensaje de ${sender} - SGP`,
                msg: msg
            }
            await this.mailerServ.sendMail(mailer('Sistema Gestion de Pedidos', email,mail.subject, mail.msg))
        } catch (error) {
            return 'Email fail'
        }
    }
}
