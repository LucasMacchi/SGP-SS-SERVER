import { Injectable } from '@nestjs/common';
import areas from "./areas.json"
import compraDto, { IinsumoCompra } from 'src/dto/compraDto';
import { MailerService } from '@nestjs-modules/mailer';
import clientReturner from 'src/utils/clientReturner';
import { addDetailDto, editCompraCant, editCompraDes } from 'src/dto/editCompraDto';
import endCode from 'src/utils/endCode';
import { IemailMsg } from 'src/utils/interfaces';
import emailCompra from 'src/utils/emailCompra';
import mailer from 'src/utils/mailer';
import { Resend } from 'resend';
import dotenv from 'dotenv'; 
import mailerResend from 'src/utils/mailerResend';
import clientReturnerViaje from 'src/utils/clientReturnerViaje';
dotenv.config();

const glpiEmail = process.env.EMAIL_GLPI ?? 'NaN'


@Injectable()
export class ComprasService {
    
    constructor(private readonly mailerServ: MailerService) {}
    //Esta funcion devuelve las areas que se necesitan para crear una compra
    async getAreas () {
        return areas.areas
    }
    //Esta funcion registra una nueva compra, se divide si se crea con una fecha de entrega o no
    async registerCompra (data: compraDto) {
        const conn = clientReturner()
        try {
            const endC = endCode()
            const base = data.fullname.length + data.tipo.length + data.compras.length
            const time = (parseInt(endC.hour) + endC.sec) * parseInt(endC.day)
            const calc = (base + time) ? (base + time) : Math.floor(Math.random() * 1000);
            const nro = "C" + calc + endC.month + endC.year;
            await conn.connect()
            const sql_compra = `INSERT INTO public.glpi_sgp_compras (area, tipo, descripcion, lugar, activado, aprobado, anulado, fullname, proveedor, fecha, nro, fecha_req,preaprobado)
            VALUES('${data.area}', '${data.tipo}', '${data.descripcion}', '${data.lugar}', true, false, false, '${data.fullname}', '${data.proveedor}', '${data.date}', '${nro}', NOW(), 'false') RETURNING compra_id;`
            const compra_id = (await conn.query(sql_compra)).rows[0]['compra_id']
            for(const i of data.compras) {
                await conn.query(`INSERT INTO public.glpi_sgp_compras_details (descripcion, cantidad, compra_id) VALUES('${i.descripcion}', ${i.cantidad}, ${compra_id});`)
            }
            const sql2 = `select email from glpi_sgp_users g where g.rol = 2;`
            const rows2 = (await conn.query(sql2)).rows
            await conn.end()
            const emails:string[] = rows2.map(e => e["email"])
            const mail: IemailMsg = {
                subject: `Compra registrada - ${nro} - ${data.fullname}`,
                msg:`Compra registrada para el area ${data.area} con el numero ${nro}.`
            }
            await mailerResend(emails,mail.subject, mail.msg)
            //await this.mailerServ.sendMail(mailer("Sistema Gestion de Pedidos", emails, mail.subject, mail.msg))
            return "Creado compra"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getViajesLogistica () {
        const conn = clientReturnerViaje()
        try {
            await conn.connect()
            const sql = 'SELECT viaje_id,des FROM public.viaje WHERE compra = false ORDER BY viaje_id ASC;'
            const rows = (await conn.query(sql)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Aprueva la compra y manda el correo al sistema de tickets, que lo carga automaticamente
    async aproveCompra (id: number,comentario: string) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `UPDATE public.glpi_sgp_compras SET fecha_aprobado=NOW(), aprobado=true,anulado=false,comentario='${comentario}' WHERE compra_id=${id} RETURNING compra_id, nro, fullname, proveedor, descripcion, fecha, area, lugar;`
            const sql_insumos = `select * from glpi_sgp_compras_details g where g.compra_id = ${id};`
            const rows = (await conn.query(sql)).rows[0]
            const rowsInsumos: IinsumoCompra[] = (await conn.query(sql_insumos)).rows
            await conn.end()
            const parsedFec = new Date(rows['fecha']).toISOString().split("T")[0]
            const mail: IemailMsg = {
                subject: `Solicitud de Compras - ${rows["nro"]} - ${rows["fullname"]}`,
                msg:emailCompra(rowsInsumos, comentario, rows["descripcion"], rows["proveedor"], parsedFec, rows['area'], rows['lugar'])
            }
            await mailerResend(glpiEmail,mail.subject, mail.msg)
            //await this.mailerServ.sendMail(mailer("Sistema Gestion de Pedidos", glpiEmail, mail.subject, mail.msg))
            return "Compra Aprobado"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Esta funcion pre aprueba una compra, esto se requiere para compras del area de racionamiento
    async preAproveCompra (id: number, comentario: string) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `UPDATE public.glpi_sgp_compras SET aprobado=false,preaprobado=true, anulado=false,comentario='${comentario}' WHERE compra_id=${id} RETURNING nro;`
            const sql2 = `select email from glpi_sgp_users g where g.rol = 2;`
            const rows = (await conn.query(sql)).rows[0]
            const rows2 = (await conn.query(sql2)).rows
            await conn.end()
            const emails:string[] = rows2.map(e => e["email"])
            const mail: IemailMsg = {
                subject: `Compra preaprobada - ${rows["nro"]}`,
                msg:`Se ha preparobado la compra ${rows["nro"]}.`
            }
            //await this.mailerServ.sendMail(mailer("Sistema Gestion de Pedidos", emails, mail.subject, mail.msg))
            return "Compra preaprobada"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Este anula o rechaza una compra
    async nullCompra (id: number, comentario: string) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `UPDATE public.glpi_sgp_compras SET aprobado=false, anulado=true,comentario='${comentario}' WHERE compra_id=${id};`
            await conn.query(sql)
            await conn.end()
            return "Compra Anulada"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Desactiva una compra para que no se muestre mas
    async deactivateCompra (id: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `UPDATE public.glpi_sgp_compras SET activado=false WHERE compra_id=${id};`
            await conn.query(sql)
            await conn.end()
            return "Compra eliminada"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Devuelve todas las compras
    async getAllCompras () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `select * from glpi_sgp_compras g where g.activado = true order by g.compra_id desc;`
            const rows = (await conn.query(sql)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Edita la cantidad de un insumo
    async editCantidad (data: editCompraCant) {
        const conn = clientReturner()
        try {
            const sql = `UPDATE public.glpi_sgp_compras_details SET cantidad=${data.cantidad} WHERE detail_id=${data.detailID};`
            await conn.connect()
            await conn.query(sql)
            await conn.end()
            return "Producto cambiado"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Edita la descripcion de un insumo
    async editDes (data: editCompraDes) {
        const conn = clientReturner()
        try {
            const sql = `UPDATE public.glpi_sgp_compras_details SET descripcion='${data.descripcion}' WHERE detail_id=${data.detailID};`
            await conn.connect()
            await conn.query(sql)
            await conn.end()
            return "Producto cambiado"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Agrega la descripcion de un insumo
    async addDes (data: addDetailDto) {
        const conn = clientReturner()
        try {
            const sql = `INSERT INTO public.glpi_sgp_compras_details (descripcion, cantidad, compra_id) VALUES('${data.descripcion}', ${data.cantidad}, ${data.compraID});`
            await conn.connect()
            await conn.query(sql)
            await conn.end()
            return "Detalle añadido"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Elimina un insumo de la compra
    async deleteProd (id: number) {
        const conn = clientReturner()
        try {
            const sql = `DELETE FROM public.glpi_sgp_compras_details WHERE detail_id=${id};`
            await conn.connect()
            await conn.query(sql)
            await conn.end()
            return "Producto eliminado"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Devuelve los detalles de una compra
    async getUniqCompras (id: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `select * from glpi_sgp_compras g where g.activado = true and g.compra_id = ${id};`
            const sql_insumos = `select * from glpi_sgp_compras_details g where g.compra_id = ${id};`
            const rows = (await conn.query(sql)).rows[0]
            const rows2 = (await conn.query(sql_insumos)).rows
            rows["compras"] = rows2
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Devuelve una compra unica usando su numero identificador
    async getUniqComprasByNro (nro: string) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `select * from glpi_sgp_compras g where g.activado = true and g.nro = '${nro.toUpperCase()}';`
            const compra_id = (await conn.query(sql)).rows[0]["compra_id"]
            await conn.end()
            return parseInt(compra_id)
        } catch (error) {
            await conn.end()
            console.log(error)
            return 0
        }
    }

}
