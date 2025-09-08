import { Injectable } from '@nestjs/common';
import { editCantidadDto } from 'src/dto/editEnvio';
import clientReturner from 'src/utils/clientReturner';
import endCode from 'src/utils/endCode';
import desglosesJson from "./desgloses.json"
import { createEnvioDto } from 'src/dto/enviosDto';
import { desgloseCount, IDetalleEnvio, IDetalleEnvioTxt, IEntregaDetalleTxt, IitemsTotal, IRemitoInd, IrequestEnvio } from 'src/utils/interfaces';
import fillEmptyTxt from 'src/utils/fillEmptyTxt';
@Injectable()
export class EnviosService {

    //Trae los lugares de entrega
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

    //Consigue todos los desgloses
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
    //Trae todos los envios
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
    //trae un envio por id
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
    //Edita la cantidad de una insuno en una compra
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
    //Funcion para rellenar un espacio vacio con ceros
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

    //Crea envios masivamente para crear remitos
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
	                envio_id, kilos, cajas, bolsas, raciones, des, tanda, unidades)
	                VALUES (${envId}, ${prod.kilos}, ${prod.cajas}, ${prod.bolsas}, ${prod.raciones},'${prod.des}', ${data.tanda}, ${prod.unidades});`
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

    //Trae los envios por una tanda especifica

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

    //Crea las lineas de texto para los dos TXTs necesarios para la importacion
    async createTxtEnvio (tanda: number, dias: number) {
        const conn = clientReturner()
        const sqlRemitos = `SELECT 
                            e.lentrega_id,
	                        e.nro_remito,
	                        d.des AS descripcion,
                            SUM(d.raciones) AS total_raciones,
                            SUM(d.kilos) AS total_kilos,
                            SUM(d.bolsas) AS total_bolsas,
                            SUM(d.cajas) AS total_cajas,
                            SUM(d.unidades) AS total_unidades
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
        const sqlDes = `select e.nro_remito, count(*) from glpi_sgp_envio e where tanda = ${tanda} group by e.nro_remito;`
        try {
            await conn.connect()
            const data1: IEntregaDetalleTxt[] = (await conn.query(sqlRemitos)).rows
            const desgloses: desgloseCount[] = (await conn.query(sqlDes)).rows
            let aux = 0
            const arrayRemitos: IRemitoInd[] = []
            data1.forEach(data => {
                if(data.lentrega_id !== aux) {
                    const detallesToAdd: IDetalleEnvioTxt[] = []
                    data1.forEach(de => {
                        if(de.lentrega_id === data.lentrega_id) {
                            const detalle: IDetalleEnvioTxt = {
                                descripcion: de.descripcion,
                                total_raciones: parseInt(de.total_raciones),
                                total_kilos: parseFloat(parseFloat(de.total_kilos).toFixed(2)),
                                total_bolsas: parseInt(de.total_bolsas),
                                total_cajas: parseInt(de.total_cajas),
                                total_unidades: parseInt(de.total_unidades)
                            }
                            detallesToAdd.push(detalle)
                        }
                    });
                    let desglosesCount = 0
                    desgloses.forEach(desc => {
                        if(desc.nro_remito === data.nro_remito) desglosesCount = desc.count;
                    });
                    const fila: IRemitoInd = {
                        remito: data.nro_remito,
                        lentrega: data.lentrega_id,
                        detalles: detallesToAdd,
                        desgloses: desglosesCount
                    }
                    arrayRemitos.push(fila)
                }
                aux = data.lentrega_id
            });
            console.log(arrayRemitos[0].detalles)
            const response = {
                cabecera: this.createCabeceraTxt(arrayRemitos),
                items: this.createItemTxt(arrayRemitos,dias)
            }
            return response

        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    //devuelve la fecha en el formato adecuado para la exportacion
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
    //Devuelve el cuit con lineas
    private cuitParserFn (cuit: number): string {
        const cuitStr = cuit.toString()
        let newCuit = ""
        for (let i = 0; i < cuitStr.length; i++) {
            newCuit += cuitStr[i]
            if(i === 1 || i === 9) newCuit +="-"
        }
        
        return newCuit
    }

    //Crea una cabecera por remito
    private createCabeceraTxt (remito: IRemitoInd[]) {
        let cabeceraLines: string[] = []
        const blank1 = [2,2,2,4,4,30,8,25,4,40]
        const blank2 = [15,15,15,15,25]
        const blank3 = [8,8,8,8,8,15,8,1,50,30,30,50,4,3,16,1,3,3,8,8,15,15,3]
        const blank4 = [1,4,8,6]
        const lines = remito.length
        for (let index = 0; index < lines; index++) {
            let line = ""
            const r = remito[index]
            const fecha = this.dateParser(new Date())
            //Comprobante
            line += fillEmptyTxt("NP",3,false,true,false)
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
            //lgar de entrega
            line += fillEmptyTxt(r.lentrega.toString(),3,false,false,true)
            //
            blank4.forEach((s) => {
                line += fillEmptyTxt("",s,true,true,false)    
            });

            cabeceraLines.push(line)
        }
        return cabeceraLines
    }

    private divisorioReturner (des: string): number {
        if(des === "9000-000078-Leche entera en polvo 800 gr") return 12
        else if(des === "9003-000011-Azucar 1 Kg") return 10
        else if(des === "9002-000011-Yerba 1 Kg") return 10
        else if(des === "9008-000083-Turron x 50 unid. 25 Gr") return 50
        else if(des === "9009-000089-Galletita caricias surtidas 12 unid. 350 Gr") return 12
        else return 0
    }

    private totalReturner (remito: IRemitoInd): IRemitoInd {
        const detalles = remito.detalles
        detalles.forEach(de => {
            const numberDiv = this.divisorioReturner(de.descripcion)
            de.total_cajas = de.total_bolsas >= numberDiv ? Math.floor(de.total_cajas + de.total_bolsas / numberDiv) : de.total_cajas
            de.total_bolsas = de.total_bolsas % numberDiv
        });
        return remito
    }

    //Esta funcion crea una los items del remito, crea el item, la leyenda del mismo y al final de todos el total.
    private createItemTxt (remito: IRemitoInd[],dias: number) {
        let cabeceraLines: string[] = []
        const blank1 = [16,16,16,4,16]
        const blank2 = [3,4,25,4,25,6,40,15,15,15,20,8]
        const blank3 = [1,5,1]
        const lines = remito.length
        for (let index = 0; index < lines; index++) {
            let itemLin = 1
            let bolsasTotal = 0
            let cajasTotal = 0
            let racionesTotal = 0
            const r = this.totalReturner(remito[index])
            const fecha = this.dateParser(new Date())
            r.detalles.forEach((detalle,i) => {
                let line = ""
                let line2 = ""
                let line3 = ""
                let linea4 = ""
                let linea5 = ""
                const de = detalle
                bolsasTotal = bolsasTotal+detalle.total_bolsas
                cajasTotal = cajasTotal+detalle.total_cajas
                racionesTotal = racionesTotal+detalle.total_raciones
                const des = de.descripcion.split("-")
                // ARTICULO ------------------------------------
                // - Comprobante
                line += fillEmptyTxt("NP",3,false,true,false)
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
                line += fillEmptyTxt(de.total_unidades.toString(),16,false,false,false)
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
                // nro renglon
                line += fillEmptyTxt(itemLin.toString(),3,false,false,false)
                blank3.forEach((s) => {
                    line += fillEmptyTxt("",s,true,true,false)    
                });
                // Leyenda ------------------------------------
                itemLin++
                //Comprobante
                line2 += fillEmptyTxt("NP",3,false,true,false)
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
                line2 += fillEmptyTxt(`Contiene: Kg ${de.total_kilos} - Cajas ${de.total_cajas} - Bolsas ${de.total_bolsas} - Rac ${de.total_raciones}`,50,false,true,false)
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
                // nro renglon
                line2 += fillEmptyTxt(itemLin.toString(),3,false,false,false)
                blank3.forEach((s) => {
                    line2 += fillEmptyTxt("",s,true,true,false)    
                });
                itemLin++
                cabeceraLines.push(line)
                cabeceraLines.push(line2)
                if(i === r.detalles.length - 1) {
                    // Leyenda ------------------------------------
                    //Comprobante
                    line3 += fillEmptyTxt("NP",3,false,true,false)
                    //Letra
                    line3 += fillEmptyTxt("R",1,false,false,false)
                    //Punto de venta
                    line3 += fillEmptyTxt(r.remito.split("-")[0],5,false,false,true)
                    //Nro comprobante
                    line3 += fillEmptyTxt(r.remito.split("-")[1],8,false,false,true)
                    //nro hasta
                    line3 += fillEmptyTxt("",8,true,false,false)
                    //fecha comprobante
                    line3 += fillEmptyTxt(fecha,8,false,true,false)
                    //cod cliente
                    line3 += fillEmptyTxt("1",6,false,false,true)
                    //tip item
                    line3 += fillEmptyTxt("L",1,false,false,true)
                    //tip item
                    line3 += fillEmptyTxt("",23,true,false,false)
                    //cant unidad 1
                    line3 += fillEmptyTxt("0.00",16,false,false,false)
                    //cant unidad 2
                    line3 += fillEmptyTxt("0.00",16,false,false,false)
                    //tip item
                    line3 += fillEmptyTxt(`Total: Cajas ${cajasTotal} - Bolsas ${bolsasTotal} - Raciones ${racionesTotal}`,50,false,true,false)
                    //prec unitario
                    line3 += fillEmptyTxt("0.00",16,false,false,false)
                    //tasa iva ins
                    line3 += fillEmptyTxt("21.00",8,false,false,false)
                    //tasa iva no ins
                    line3 += fillEmptyTxt("",8,true,false,false)
                    //imp iva ins
                    line3 += fillEmptyTxt("0.00",16,false,false,false)
                    //imp iva no ins
                    line3 += fillEmptyTxt("",16,true,false,false)
                    //imp total
                    line3 += fillEmptyTxt("0.00",16,false,false,false)
                    //19 - 23
                    blank1.forEach((s) => {
                        line3 += fillEmptyTxt("",s,true,true,false)    
                    });
                    //tip iva
                    line3 += fillEmptyTxt("",1,true,false,false)
                    //cod desc
                    line3 += fillEmptyTxt("",2,true,false,false)
                    //imp desc
                    line3 += fillEmptyTxt("",16,true,false,false)
                    //deposito
                    line3 += fillEmptyTxt("",3,true,false,false)
                    //partida
                    line3 += fillEmptyTxt("",26,true,false,false)
                    //tasa desc
                    line3 += fillEmptyTxt("",8,true,false,false)
                    //imp renglon
                    line3 += fillEmptyTxt("0.00",16,false,false,false)
                    //31 - 46
                    blank2.forEach((s) => {
                        line3 += fillEmptyTxt("",s,true,true,false)    
                    });
                    // nro renglon
                    line3 += fillEmptyTxt(itemLin.toString(),3,false,false,false)
                    blank3.forEach((s) => {
                        line3 += fillEmptyTxt("",s,true,true,false)    
                    });
                    cabeceraLines.push(line3)
                }
                    // Leyenda ------------------------------------
                    //Comprobante
                    linea4 += fillEmptyTxt("NP",3,false,true,false)
                    //Letra
                    linea4 += fillEmptyTxt("R",1,false,false,false)
                    //Punto de venta
                    linea4 += fillEmptyTxt(r.remito.split("-")[0],5,false,false,true)
                    //Nro comprobante
                    linea4 += fillEmptyTxt(r.remito.split("-")[1],8,false,false,true)
                    //nro hasta
                    linea4 += fillEmptyTxt("",8,true,false,false)
                    //fecha comprobante
                    linea4 += fillEmptyTxt(fecha,8,false,true,false)
                    //cod cliente
                    linea4 += fillEmptyTxt("1",6,false,false,true)
                    //tip item
                    linea4 += fillEmptyTxt("L",1,false,false,true)
                    //tip item
                    linea4 += fillEmptyTxt("",23,true,false,false)
                    //cant unidad 1
                    linea4 += fillEmptyTxt("0.00",16,false,false,false)
                    //cant unidad 2
                    linea4 += fillEmptyTxt("0.00",16,false,false,false)
                    //tip item
                    linea4 += fillEmptyTxt(`Total de desgloses: ${r.desgloses}`,50,false,true,false)
                    //prec unitario
                    linea4 += fillEmptyTxt("0.00",16,false,false,false)
                    //tasa iva ins
                    linea4 += fillEmptyTxt("21.00",8,false,false,false)
                    //tasa iva no ins
                    linea4 += fillEmptyTxt("",8,true,false,false)
                    //imp iva ins
                    linea4 += fillEmptyTxt("0.00",16,false,false,false)
                    //imp iva no ins
                    linea4 += fillEmptyTxt("",16,true,false,false)
                    //imp total
                    linea4 += fillEmptyTxt("0.00",16,false,false,false)
                    //19 - 23
                    blank1.forEach((s) => {
                        linea4 += fillEmptyTxt("",s,true,true,false)    
                    });
                    //tip iva
                    linea4 += fillEmptyTxt("",1,true,false,false)
                    //cod desc
                    linea4 += fillEmptyTxt("",2,true,false,false)
                    //imp desc
                    linea4 += fillEmptyTxt("",16,true,false,false)
                    //deposito
                    linea4 += fillEmptyTxt("",3,true,false,false)
                    //partida
                    linea4 += fillEmptyTxt("",26,true,false,false)
                    //tasa desc
                    linea4 += fillEmptyTxt("",8,true,false,false)
                    //imp renglon
                    linea4 += fillEmptyTxt("0.00",16,false,false,false)
                    //31 - 46
                    blank2.forEach((s) => {
                        linea4 += fillEmptyTxt("",s,true,true,false)    
                    });
                    // nro renglon
                    linea4 += fillEmptyTxt(itemLin.toString(),3,false,false,false)
                    blank3.forEach((s) => {
                        linea4 += fillEmptyTxt("",s,true,true,false)    
                    });
                    cabeceraLines.push(linea4)
                    // Leyenda ------------------------------------
                    //Comprobante
                    linea5 += fillEmptyTxt("NP",3,false,true,false)
                    //Letra
                    linea5 += fillEmptyTxt("R",1,false,false,false)
                    //Punto de venta
                    linea5 += fillEmptyTxt(r.remito.split("-")[0],5,false,false,true)
                    //Nro comprobante
                    linea5 += fillEmptyTxt(r.remito.split("-")[1],8,false,false,true)
                    //nro hasta
                    linea5 += fillEmptyTxt("",8,true,false,false)
                    //fecha comprobante
                    linea5 += fillEmptyTxt(fecha,8,false,true,false)
                    //cod cliente
                    linea5 += fillEmptyTxt("1",6,false,false,true)
                    //tip item
                    linea5 += fillEmptyTxt("L",1,false,false,true)
                    //tip item
                    linea5 += fillEmptyTxt("",23,true,false,false)
                    //cant unidad 1
                    linea5 += fillEmptyTxt("0.00",16,false,false,false)
                    //cant unidad 2
                    linea5 += fillEmptyTxt("0.00",16,false,false,false)
                    //tip item
                    linea5 += fillEmptyTxt(`Raciones por ${dias} dias habiles`,50,false,true,false)
                    //prec unitario
                    linea5 += fillEmptyTxt("0.00",16,false,false,false)
                    //tasa iva ins
                    linea5 += fillEmptyTxt("21.00",8,false,false,false)
                    //tasa iva no ins
                    linea5 += fillEmptyTxt("",8,true,false,false)
                    //imp iva ins
                    linea5 += fillEmptyTxt("0.00",16,false,false,false)
                    //imp iva no ins
                    linea5 += fillEmptyTxt("",16,true,false,false)
                    //imp total
                    linea5 += fillEmptyTxt("0.00",16,false,false,false)
                    //19 - 23
                    blank1.forEach((s) => {
                        linea5 += fillEmptyTxt("",s,true,true,false)    
                    });
                    //tip iva
                    linea5 += fillEmptyTxt("",1,true,false,false)
                    //cod desc
                    linea5 += fillEmptyTxt("",2,true,false,false)
                    //imp desc
                    linea5 += fillEmptyTxt("",16,true,false,false)
                    //deposito
                    linea5 += fillEmptyTxt("",3,true,false,false)
                    //partida
                    linea5 += fillEmptyTxt("",26,true,false,false)
                    //tasa desc
                    linea5 += fillEmptyTxt("",8,true,false,false)
                    //imp renglon
                    linea5 += fillEmptyTxt("0.00",16,false,false,false)
                    //31 - 46
                    blank2.forEach((s) => {
                        linea5 += fillEmptyTxt("",s,true,true,false)    
                    });
                    // nro renglon
                    linea5 += fillEmptyTxt(itemLin.toString(),3,false,false,false)
                    blank3.forEach((s) => {
                        linea5 += fillEmptyTxt("",s,true,true,false)    
                    });
                    cabeceraLines.push(linea5)
            });

        }
        return cabeceraLines
    }
    

}
