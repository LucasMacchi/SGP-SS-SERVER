import { Injectable } from '@nestjs/common';
import poolReturner from 'src/utils/connectionPool';

@Injectable()
export class UserService {
    //Connection
    private readonly pool = poolReturner()
    //Crea un usuario con sql
    async createUser(username: string, first_name: string, last_name: string, 
        rol: number){
        const slq = `insert into glpi_sgp_users (username, first_name, last_name , rol, date_creation, activated ) 
        value ('${username}', '${first_name}', '${last_name}', ${rol}, NOW(), false );`
        await this.pool.query(slq)
    }
    //Activa un usuario con sql
    async activateUser (usr: string) {
        const slq = `UPDATE glpi_sgp_users gsu set activated = true , date_activation = NOW() where username = "${usr}";`
        await this.pool.query(slq)
    }
    //Desactivar un Usuario con sql
    async deactivateUser (usr: string) {
        const slq = `UPDATE glpi_sgp_users gsu set activated = false , date_deactivation = NOW() where username = "${usr}";`
        await this.pool.query(slq)
    }
    //Traer todos los usuarios por sql
    async getAll () {
        const sql = `select username, first_name, last_name, rol from glpi_sgp_users gsu ;`
        const [rows, fiels] = await this.pool.query(sql)
        return rows
    }
    //Login
    async login (usr: string) {
        const sql = `select username, rol, activated from glpi_sgp_users gsu where gsu.username = '${usr}'; ;`
        const [rows, fiels] = await this.pool.query(sql)
        return rows
    }
}