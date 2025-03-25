import { Injectable } from '@nestjs/common';
import poolReturner from 'src/utils/connectionPool';

@Injectable()
export class UserService {
    //Crea un usuario con sql
    async createUser(username: string, first_name: string, last_name: string, 
        rol: number, email:string){
        const conn = await poolReturner().getConnection()
        const slq = `insert into glpi_sgp_users (username, first_name, last_name , rol, date_creation, activated, email ) 
        value ('${username}', '${first_name}', '${last_name}', ${rol}, NOW(), false, '${email}' );`
        await conn.query(slq)
        conn.destroy()
    }
    //Activa un usuario con sql
    async activateUser (usr: string) {
        const conn = await poolReturner().getConnection()
        const slq = `UPDATE glpi_sgp_users gsu set activated = true , date_activation = NOW() where username = "${usr}";`
        await conn.query(slq)
        conn.destroy()
    }
    //Desactivar un Usuario con sql
    async deactivateUser (usr: string) {
        const conn = await poolReturner().getConnection()
        const slq = `UPDATE glpi_sgp_users gsu set activated = false , date_deactivation = NOW() where username = "${usr}";`
        await conn.query(slq)
        conn.destroy()
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