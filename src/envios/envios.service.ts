import { Injectable } from '@nestjs/common';
import { editCantidadDto } from 'src/dto/editEnvio';
import clientReturner from 'src/utils/clientReturner';
import endCode from 'src/utils/endCode';
import desglosesJson from "./desgloses.json"
import { createEnvioDto } from 'src/dto/enviosDto';
import { IDetalleEnvio, IDetalleEnvioTxt, IEntregaDetalleTxt, IRemitoInd, IrequestEnvio } from 'src/utils/interfaces';
import fillEmptyTxt from 'src/utils/fillEmptyTxt';
@Injectable()
export class EnviosService {

    async getLugaresEntrega () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = "SELECT * FROM public.glpi_sgp_lentrega;"
            const rows = (await conn.query(sql)).rows
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getDesgloses () {

        //ACA
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = "SELECT * FROM public.glpi_sgp_desglose;"
            const rows = (await conn.query(sql)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getEnvios () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = "SELECT * FROM public.glpi_sgp_envio;"
            const rows = (await conn.query(sql)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getEnviosUniq (id:number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `SELECT * FROM public.glpi_sgp_envio where envio_id = ${id};`
            const rows = (await conn.query(sql)).rows[0]
            const sql2 = `SELECT * FROM public.glpi_sgp_envio_details where envio_id = ${id};`
            const rows2 = (await conn.query(sql2)).rows
            rows['insumos'] = rows2
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async editCantidad (data: editCantidadDto) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `UPDATE public.glpi_sgp_envio_details SET ${data.column}=${data.cantidad} WHERE detail_id=${data.detail_id};`
            await conn.query(sql)
            await conn.end()
            return "Cantidad editada"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
        
    }

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

    async createEnvios (data: createEnvioDto) {
        const conn = clientReturner()
        try {
            let created = 0
            let prodCreated = 0
            await conn.connect()
            let aux = data.enviados[0].entregaId
            const sqlTandaUpdate = `UPDATE public.glpi_sgp_config SET payload=${data.tanda} WHERE config_id= 1;`
            await conn.query(sqlTandaUpdate)
            for(const envio of data.enviados) {
                if(envio.entregaId > aux) {
                    aux = envio.entregaId
                    data.start_remito++
                }
                const nro_remito = this.emptyFill(5,data.pv_remito)+"-"+this.emptyFill(6,data.start_remito)
                const sql = `INSERT INTO public.glpi_sgp_envio(
	            lentrega_id, dependencia, exported,fecha_created, nro_remito, tanda)
	            VALUES (${envio.entregaId}, '${envio.desglose}', false, NOW(),'${nro_remito}', ${data.tanda}) RETURNING envio_id;`
                const envId = (await conn.query(sql)).rows[0]["envio_id"]
                for (const prod of envio.detalles) {
                    const sql2 = `INSERT INTO public.glpi_sgp_envio_details(
	                envio_id, kilos, cajas, bolsas, raciones, des, tanda)
	                VALUES (${envId}, ${prod.kilos}, ${prod.cajas}, ${prod.bolsas}, ${prod.raciones},'${prod.des}', ${data.tanda});`
                    await conn.query(sql2)
                    prodCreated++
                }
                created++
            }
            await conn.end()
            return "Envios creados: "+created+ "\nProductos agregados: "+ prodCreated +"\nEnvios no creados por falta de lugar de entrega: "+data.no_lugarentrega+"\nEnvios sin insumos: "+data.no_insumo
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async getTandaEnvios (tanda: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `SELECT * FROM public.glpi_sgp_envio e INNER JOIN public.glpi_sgp_lentrega l on e.lentrega_id = l.lentrega_id where e.tanda = ${tanda} ORDER BY e.lentrega_id ASC;`
            const sql2 = `SELECT * FROM public.glpi_sgp_envio_details WHERE tanda = ${tanda};`
            const envios: IrequestEnvio[] = (await conn.query(sql)).rows
            const detalles: IDetalleEnvio[] = (await conn.query(sql2)).rows
            envios.forEach(env => {
                env.detalles = detalles.filter((d) => d.envio_id === env.envio_id)
                
            });
            return envios
            
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async getCurrentTanda () {
        const conn = clientReturner()
        try {
            
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async createTxtEnvio (tanda: number) {
        const conn = clientReturner()
        const sqlRemitos = `SELECT 
                            e.lentrega_id,
	                        e.nro_remito,
	                        d.des AS descripcion,
                            SUM(d.raciones) AS total_raciones,
                            SUM(d.kilos) AS total_kilos,
                            SUM(d.bolsas) AS total_bolsas,
                            SUM(d.cajas) AS total_cajas
                            FROM 
                                glpi_sgp_envio e
                            JOIN 
                                glpi_sgp_envio_details d ON e.envio_id = d.envio_id
                            WHERE
                            	e.tanda = ${tanda}
                            GROUP BY 
                                e.lentrega_id,
                            	e.nro_remito,
                            	d.des
                            ORDER BY 
                                e.lentrega_id;`
        try {
            await conn.connect()
            const data1: IEntregaDetalleTxt[] = (await conn.query(sqlRemitos)).rows
            let aux = 0
            const arrayRemitos: IRemitoInd[] = []
            data1.forEach(data => {
                if(data.lentrega_id !== aux) {
                    const fila: IRemitoInd = {
                        remito: data.nro_remito,
                        lentrega: data.lentrega_id,
                        detalles: data1.filter((de) => {
                            if(de.lentrega_id === data.lentrega_id) {
                                const detalle: IDetalleEnvioTxt = {
                                    descripcion: de.descripcion,
                                    total_raciones: de.total_raciones,
                                    total_kilos: de.total_kilos,
                                    total_bolsas: de.total_bolsas,
                                    total_cajas: de.total_cajas
                                }
                                return detalle
                            }
                        })
                    }
                    arrayRemitos.push(fila)
                }
                aux = data.lentrega_id
            });
            const response = {
                cabecera: this.createCabeceraTxt(arrayRemitos),
                items: this.createItemTxt(arrayRemitos)
            }
            return response

        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

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
    private cuitParserFn (cuit: number): string {
        const cuitStr = cuit.toString()
        let newCuit = ""
        for (let i = 0; i < cuitStr.length; i++) {
            newCuit += cuitStr[i]
            if(i === 1 || i === 9) newCuit +="-"
        }
        
        return newCuit
    }
    private createCabeceraTxt (remito: IRemitoInd[]) {
        let cabeceraLines: string[] = []
        const blank1 = [2,2,2,4,4,30,8,25,4,40]
        const blank2 = [15,15,15,15,25]
        const blank3 = [8,8,8,8,8,15,8,1,50,30,30,50,4,3,16,1,3,3,8,8,15,15,3,3,1,4,8,6]
        const lines = remito.length
        for (let index = 0; index < lines; index++) {
            let line = ""
            const r = remito[index]
            const fecha = this.dateParser(new Date())
            //Comprobante
            line += fillEmptyTxt("RT",3,false,true,false)
            //Letra
            line += fillEmptyTxt("R",1,false,false,false)
            //Punto de venta
            line += fillEmptyTxt(r.remito.split("-")[0],5,false,false,true)
            //Nro comprobante
            line += fillEmptyTxt(r.remito.split("-")[1],8,false,false,true)
            //nro hasta
            line += fillEmptyTxt("",8,true,false,false)
            //fecha comprobante
            line += fillEmptyTxt(fecha,8,false,true,false)
            //cod cliente
            line += fillEmptyTxt("1",6,false,false,true)
            //raz soc client
            line += fillEmptyTxt("MINISTERIO DE EDUCACION DE CORRIENTES",40,false,true,false)
            //tip docu
            line += fillEmptyTxt("1",2,false,true,false)
            //cod prov
            line += fillEmptyTxt("5",3,false,false,true)
            //situ iva
            line += fillEmptyTxt("5",1,false,true,false)
            //cuit
            line += fillEmptyTxt("30707318240",11,false,false,false)
            //Nro igresos brutos prov (igual cuit)
            line += fillEmptyTxt(this.cuitParserFn(30707318240),15,false,true,false)
            //cod vend
            line += fillEmptyTxt("1",4,false,false,false)
            //Cod zona
            line += fillEmptyTxt("",4,true,true,false)
            //clasifica adic client
            line += fillEmptyTxt("PUB",4,false,true,false)
            //cod vent clien
            line += fillEmptyTxt("2",3,false,true,false)
            //cod causa emis
            line += fillEmptyTxt("",4,true,true,false)
            //fecha venc
            line += fillEmptyTxt(fecha,8,false,true,false)
            //fecha venc
            line += fillEmptyTxt("0.00",16,false,false,false)
            //21 - 29
            blank1.forEach((s) => {
                line += fillEmptyTxt("",s,true,true,false)    
            });
            //compr anul
            line += fillEmptyTxt(" ",1,false,false,false)
            //act stock
            line += fillEmptyTxt("S",1,false,false,false)
            //33 - 37
            blank2.forEach((s) => {
                line += fillEmptyTxt("",s,true,true,false)    
            });
            //no disp
            line += fillEmptyTxt(" ",1,true,true,false)
            //39 - 66
            blank3.forEach((s) => {
                line += fillEmptyTxt("",s,true,true,false)    
            });

            cabeceraLines.push(line)
        }
        return cabeceraLines
    }

    private createItemTxt (remito: IRemitoInd[]) {
        let cabeceraLines: string[] = []
        const blank1 = [16,16,16,4,16]
        const blank2 = [3,4,25,4,25,6,40,15,15,15,20,8,3,1,5,1]
        const lines = remito.length
        for (let index = 0; index < lines; index++) {
            
            const r = remito[index]
            const fecha = this.dateParser(new Date())
            r.detalles.forEach(detalle => {
                let line = ""
                let line2 = ""
                const de = detalle
                const des = de.descripcion.split("-")
                // ARTICULO ------------------------------------
                // - Comprobante
                line += fillEmptyTxt("RT",3,false,true,false)
                //Letra
                line += fillEmptyTxt("R",1,false,false,false)
                //Punto de venta
                line += fillEmptyTxt(r.remito.split("-")[0],5,false,false,true)
                //Nro comprobante
                line += fillEmptyTxt(r.remito.split("-")[1],8,false,false,true)
                //nro hasta
                line += fillEmptyTxt("",8,true,false,false)
                //fecha comprobante
                line += fillEmptyTxt(fecha,8,false,true,false)
                //cod cliente
                line += fillEmptyTxt("1",6,false,false,true)
                //tip item
                line += fillEmptyTxt("A",1,false,false,true)
                //tip item
                line += fillEmptyTxt(des[0]+"-"+des[1],23,false,true,false)
                //cant unidad 1
                line += fillEmptyTxt(de.total_kilos.toString(),16,false,false,false)
                //cant unidad 2
                line += fillEmptyTxt("0.00",16,false,false,false)
                //tip item
                line += fillEmptyTxt(des[2],50,false,true,false)
                //prec unitario
                line += fillEmptyTxt("0.00",16,false,false,false)
                //tasa iva ins
                line += fillEmptyTxt("21.00",8,false,false,false)
                //tasa iva no ins
                line += fillEmptyTxt("",8,true,false,false)
                //imp iva ins
                line += fillEmptyTxt("0.00",16,false,false,false)
                //imp iva no ins
                line += fillEmptyTxt("",16,true,false,false)
                //imp total
                line += fillEmptyTxt("0.00",16,false,false,false)
                //19 - 23
                blank1.forEach((s) => {
                    line += fillEmptyTxt("",s,true,true,false)    
                });
                //tip iva
                line += fillEmptyTxt("1",1,false,true,false)
                //cod desc
                line += fillEmptyTxt("",2,true,false,false)
                //imp desc
                line += fillEmptyTxt("",16,true,false,false)
                //deposito
                line += fillEmptyTxt("CEN",3,false,true,false)
                //partida
                line += fillEmptyTxt("",26,true,false,false)
                //tasa desc
                line += fillEmptyTxt("",8,true,false,false)
                //imp renglon
                line += fillEmptyTxt("0.00",16,false,false,false)
                //31 - 46
                blank2.forEach((s) => {
                    line += fillEmptyTxt("",s,true,true,false)    
                });
                // Leyenda ------------------------------------
                //Comprobante
                line2 += fillEmptyTxt("RT",3,false,true,false)
                //Letra
                line2 += fillEmptyTxt("R",1,false,false,false)
                //Punto de venta
                line2 += fillEmptyTxt(r.remito.split("-")[0],5,false,false,true)
                //Nro comprobante
                line2 += fillEmptyTxt(r.remito.split("-")[1],8,false,false,true)
                //nro hasta
                line2 += fillEmptyTxt("",8,true,false,false)
                //fecha comprobante
                line2 += fillEmptyTxt(fecha,8,false,true,false)
                //cod cliente
                line2 += fillEmptyTxt("1",6,false,false,true)
                //tip item
                line2 += fillEmptyTxt("L",1,false,false,true)
                //tip item
                line2 += fillEmptyTxt("",23,true,false,false)
                //cant unidad 1
                line2 += fillEmptyTxt("0.00",16,false,false,false)
                //cant unidad 2
                line2 += fillEmptyTxt("0.00",16,false,false,false)
                //tip item
                line2 += fillEmptyTxt(`Contiene: Cajas ${de.total_cajas} - Bolsas ${de.total_bolsas} - Raciones ${de.total_raciones}`,50,false,true,false)
                //prec unitario
                line2 += fillEmptyTxt("0.00",16,false,false,false)
                //tasa iva ins
                line2 += fillEmptyTxt("21.00",8,false,false,false)
                //tasa iva no ins
                line2 += fillEmptyTxt("",8,true,false,false)
                //imp iva ins
                line2 += fillEmptyTxt("0.00",16,false,false,false)
                //imp iva no ins
                line2 += fillEmptyTxt("",16,true,false,false)
                //imp total
                line2 += fillEmptyTxt("0.00",16,false,false,false)
                //19 - 23
                blank1.forEach((s) => {
                    line2 += fillEmptyTxt("",s,true,true,false)    
                });
                //tip iva
                line2 += fillEmptyTxt("",1,true,false,false)
                //cod desc
                line2 += fillEmptyTxt("",2,true,false,false)
                //imp desc
                line2 += fillEmptyTxt("",16,true,false,false)
                //deposito
                line2 += fillEmptyTxt("",3,true,false,false)
                //partida
                line2 += fillEmptyTxt("",26,true,false,false)
                //tasa desc
                line2 += fillEmptyTxt("",8,true,false,false)
                //imp renglon
                line2 += fillEmptyTxt("0.00",16,false,false,false)
                //31 - 46
                blank2.forEach((s) => {
                    line2 += fillEmptyTxt("",s,true,true,false)    
                });
                cabeceraLines.push(line)
                cabeceraLines.push(line2)
            });

        }
        return cabeceraLines
    }
    

}
//"MINISTERIO DE EDUCACION DE CORRIENTES"