import { Injectable } from '@nestjs/common';
import { editCantidadDto } from 'src/dto/editEnvio';
import clientReturner from 'src/utils/clientReturner';
import { createEnvioDto } from 'src/dto/enviosDto';
import { IConformidad,desgloseCount, IDetalleEnvio, IDetalleEnvioTxt, IEntregaDetalleTxt, IDesglosesRuta, ITotalRutas, IRemitoInd, IrequestEnvio, IRutaTotalsParsed, IRemitoRuta, IinformeEnvioRatios, IinformeSum, ITandaLog, IPlan, IDetailPlan, IPlanComplete, IChangeEnvioInsumo, IDateExport, IRemitoEnvio, IRemitoEntrega, IDepartamentoRes, IDesglosesReturner, ICabecera, IRemitosEnvio, IDelCues, IReporteEnvio } from 'src/utils/interfaces';
import fillEmptyTxt from 'src/utils/fillEmptyTxt';
import { cabecerasSQL, conformidadSql, conformidadSqlCustom, createReporteSQL, deglosesSQL, deleteRemitoLogSQL, deleteTandaLogSQL, deleteTandaSQL, estadoRemitoLogSQL, estadoRemitosSQL, getRemitoSQL, gobackRemitoSQL, rutaSql, rutaSqlCustom, rutaSqlRemito, rutaSqlRemitoCustom, rutaSqlTotales, rutaSqlTotalesCustom, txtSql, verRemitosSQL } from 'src/utils/sqlReturner';
import dotenv from 'dotenv'; 
import editInsumoEnvioDto from 'src/dto/editInsumoEnvioDto';
import editInsumoEnvioPlanDto from 'src/dto/editInsumoEnvioPlanDto';
import rangeReturner from 'src/utils/rangeReturner';
import customRemitosReturner from 'src/utils/customRemitosReturner';
import addReporteEnvio from 'src/dto/addReporteEnvio';
dotenv.config();

const DELETE_KEY = process.env.TANDA_DELETE_KEY ?? 'NaN'


@Injectable()
export class EnviosService {

    //Traer informe de remitos creados en una fecha
    async getInformeFecha (fecha: string) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `select l.lentrega_id,l.completo,e.dependencia,l.localidad,l.direccion,e.nro_remito,e.fecha_created,e.tanda from glpi_sgp_envio e join glpi_sgp_lentrega l on e.lentrega_id = l.lentrega_id where e.fecha_created = '${fecha}' order by nro_remito ASC;`
            const envios: IDateExport[] = (await conn.query(sql)).rows
            await conn.end()
            let datos: string[] = []
            envios.forEach(en => {
                const parsedDate = new Date(en.fecha_created).toISOString().split("T")[0]
                datos.push(`${en.lentrega_id} | ${en.nro_remito} -> ${en.completo} -- ${en.dependencia} -- LOC: ${en.localidad} -- DIR: ${en.direccion} -- ${parsedDate} -- T:${en.tanda}\n`)
            });
            return datos
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    
    }

    //Traer el ultimo remito
    async getLastRt () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `select * from glpi_sgp_config where config_id = 1;`
            const pv:number = (await conn.query(sql)).rows[0]["payload"]
            await conn.end()
            return pv - 1
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Traer el ultimo remito
    async getCai () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `select * from glpi_sgp_config where config_id = 4;`
            const pv:number = (await conn.query(sql)).rows[0]["payload"]
            await conn.end()
            return pv
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Traer el ultimo remito
    async getFechVenc () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `select * from glpi_sgp_config where config_id = 5;`
            const pv:number = (await conn.query(sql)).rows[0]["payload"]
            await conn.end()
            return pv
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Traer punto de venta actual
    async getPv () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `select * from glpi_sgp_config where config_id = 2;`
            const pv = (await conn.query(sql)).rows[0]["payload"]
            await conn.end()
            return pv
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getFinTalo () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `select * from glpi_sgp_config where config_id = 6;`
            const pv = (await conn.query(sql)).rows[0]["payload"]
            await conn.end()
            return pv
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Traer el ultimo remito
    async updateData (payload: number,id: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `UPDATE public.glpi_sgp_config SET payload=${payload} WHERE config_id=${id};`
            await conn.query(sql)
            await conn.end()
            return "Config modificado "+payload+" id "+id
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Crear plan
    async AddPlan (des:string, dias:number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `INSERT INTO public.glpi_sgp_envio_plan(des, dias) VALUES ('${des}', ${dias});`
            await conn.query(sql)
            await conn.end()
            return "Plan "+des+" creado."
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Agregar insumo al plan
    async AddInsumosPlan (plan_id: number, ins_id: number,dias: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `INSERT INTO public.glpi_sgp_envio_plan_detail(plan_id, ins_id, dias) VALUES (${plan_id}, ${ins_id}, ${dias});`
            await conn.query(sql)
            await conn.end()
            return "Insumo agregado al plan"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Eliminar detalle de plan
    async delInsumosPlan (id: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `DELETE FROM public.glpi_sgp_envio_plan_detail WHERE detail_id=${id};`
            await conn.query(sql)
            await conn.end()
            return "Insumo eliminado del plan"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Editar dias detalle plan
    async patchInsumosPlan (data: editInsumoEnvioPlanDto) {
        const conn = clientReturner()
        try {
            await conn.connect()
            console.log(data.newVal)
            const sql = `UPDATE public.glpi_sgp_envio_plan_detail SET dias=${data.newVal} WHERE detail_id=${data.detail_id};`
            await conn.query(sql)
            await conn.end()
            return "Insumo editado en el plan, nuevo valor -> "+data.newVal
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Editar insumo
    async patchInsumosEnvios (data: editInsumoEnvioDto) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = `UPDATE public.glpi_sgp_envio_insumo SET ${data.stat}=${data.newVal} WHERE ins_id=${data.ins_id};`
            await conn.query(sql)
            await conn.end()
            return "Insumo editado: "+data.stat+" -> "+data.newVal
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Trae los planes para la creacion de envios
    async getPlanesEnvios () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = "SELECT * FROM glpi_sgp_envio_plan ORDER BY plan_id ASC;"
            const rowsPlan: IPlan[] = (await conn.query(sql)).rows
            const sql2 = `SELECT d.detail_id, d.plan_id,d.ins_id,i.des,d.dias FROM glpi_sgp_envio_plan_detail d JOIN glpi_sgp_envio_insumo i on d.ins_id = i.ins_id ORDER BY plan_id ASC;`
            const rowsDetails: IDetailPlan[] = (await conn.query(sql2)).rows
            let data: IPlanComplete[] = []
            rowsPlan.forEach(p => {
                let data1: IPlanComplete ={plan_id: p.plan_id, des: p.des, dias: p.dias,details:[]}
                rowsDetails.forEach(d => {
                    if(d.plan_id === p.plan_id) data1.details.push({...d, des: d.des.split("-")[2]})
                });
                data.push(data1)
            });
            await conn.end()
            return data
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Trae los insumos de copa de leche y alimento fortificadoo
    async getInsumosEnvios () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = "SELECT * FROM public.glpi_sgp_envio_insumo ORDER BY ins_id ASC;"
            const rows = (await conn.query(sql)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Trae los lugares de entrega
    async getLugaresDeEntrega () {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = "SELECT * FROM public.glpi_sgp_lentrega ORDER BY lentrega_id ASC;"
            const rows = (await conn.query(sql)).rows
            await conn.end()
            return rows
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Trae los lugares de entrega
    async getLugaresEntrega (departamento: string, fortificado: number) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = deglosesSQL(departamento,fortificado)
            const rows1: IDesglosesReturner[] = (await conn.query(sql)).rows
            const cabecerasUnfilter: Map<number,string> = new Map(rows1.map(d => [d.lentrega_id,d.completo]))
            const cabecerasFiltered = Array.from(cabecerasUnfilter.entries()).map(([lentrega_id, completo]) => ({lentrega_id, completo}))
            const data = {
                cabeceras: cabecerasFiltered,
                desgloses: rows1
            }
            await conn.end()
            return data
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    //Trae los Departamentos
    async getDepartamentos() {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sql = "select departamento from glpi_sgp_lentrega group by departamento order by departamento;"
            const rows: IDepartamentoRes[] = (await conn.query(sql)).rows
            const res:string[] = rows.map(d => d.departamento) 
            await conn.end()
            return res
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    //Eliminar tanda
    async deleteTanda (tanda: number, key: string) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sqlTanda = `select MAX(tanda) from glpi_sgp_envio;`
            const sqlCues = `SELECT cue,fortificado FROM public.glpi_sgp_envio where tanda = ${tanda};`
            const tandaMax: number = await (await conn.query(sqlTanda)).rows[0]["max"]
            const cues: IDelCues[] = (await conn.query(sqlCues)).rows
            if(key === DELETE_KEY && tanda === tandaMax) {
                if(cues[0].cue) {
                    for(const e of cues) {
                        let sqlC = ``
                        if(e.fortificado) {
                            sqlC = `UPDATE public.glpi_sgp_desgloses SET sent_al=false WHERE cue = ${parseInt(e.cue)};`
                        }
                        else {
                            sqlC = `UPDATE public.glpi_sgp_desgloses SET sent_cl=false WHERE cue = ${parseInt(e.cue)};`
                        }
                        await conn.query(sqlC)
                    }
                }

                await conn.query(deleteRemitoLogSQL(tanda))
                await conn.query(deleteTandaSQL(tanda))
                await conn.query(gobackRemitoSQL(tanda))
                await conn.query(deleteTandaLogSQL(tanda))
                await conn.end()
                return "Tanda eliminada: "+tanda+" | Se volvio remitos para atras."
            }
            else if(key === DELETE_KEY) {
                await conn.query(deleteRemitoLogSQL(tanda))
                await conn.query(deleteTandaSQL(tanda))
                await conn.query(deleteTandaLogSQL(tanda))
                await conn.end()
                return "Tanda eliminada: "+tanda
            }
            else {
                return "Clave equivocada."
            }
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Consigue todos los desgloses
    async getDesgloses () {
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

    async verRemitos () {
        const conn = clientReturner() 
        try {
            await conn.connect()
            const remitos: IRemitosEnvio[] = (await conn.query(verRemitosSQL())).rows
            await conn.end()
            return remitos
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async patchRemitos (state: string, remito: string) {
        const conn = clientReturner() 
        try {
            await conn.connect()
            const tanda:number = (await conn.query(estadoRemitosSQL(state,remito))).rows[0]["tanda"]
            await conn.query(estadoRemitoLogSQL(tanda, state, remito))
            await conn.end()
            return "Remito modificado "+state
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async createReporte (data: addReporteEnvio) {
        const conn = clientReturner()
        try {
            await conn.connect()
            await conn.query(createReporteSQL(data.titulo,data.des,data.remito))
            await conn.end()
            return "Reporte creado"
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async verRemitoReportes (remito: string) {
        const conn = clientReturner() 
        try {
            await conn.connect()
            const remitos: IReporteEnvio[] = (await conn.query(getRemitoSQL(remito))).rows
            await conn.end()
            return remitos
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }


    //Crea envios masivamente para crear remitos
    async createEnvios (data: createEnvioDto) {
        const conn = clientReturner()
        try {
            const log: ITandaLog = {
                nro_tanda: 0,
                remitos: 0,
                remitos_iniciales: 0,
                desgloses: 0,
                pv: 0
            }
            let created = 0
            let prodCreated = 0
            await conn.connect()
            //data previa
            const sqlTanda = `select MAX(tanda) from glpi_sgp_envio;`
            const sqlPv = "select payload from glpi_sgp_config where config_id = 2;"
            const sqlRemito = "select payload from glpi_sgp_config where config_id = 1;"
            const sqlRemitoFinTalonario = "select payload from glpi_sgp_config where config_id = 6;"
            let startRemito = await (await conn.query(sqlRemito)).rows[0]["payload"]
            const pv = await (await conn.query(sqlPv)).rows[0]["payload"]
            const finTalo = await (await conn.query(sqlRemitoFinTalonario)).rows[0]["payload"]
            const startRemitoConst = startRemito
            console.log("TRAIDO = "+startRemitoConst)
            log.remitos_iniciales = startRemitoConst
            log.pv = pv
            const tanda = await (await conn.query(sqlTanda)).rows[0]["max"] + 1
            //carga de envios
            const enviosTotal: IrequestEnvio[][] = []
            if(data.enviadosAL.length > 0) enviosTotal.push(data.enviadosAL.sort((a,b) => a.entregaId - b.entregaId))
            if(data.enviadosCL.length > 0) enviosTotal.push(data.enviadosCL.sort((a,b) => a.entregaId - b.entregaId))
            startRemito++
            for(const env of enviosTotal) {
                let aux = env[0].entregaId
                for(const envio of env) {
                    if(envio.entregaId !== aux) {
                        aux = envio.entregaId
                        startRemito++
                    }
                    const nro_remito = this.emptyFill(5,pv)+"-"+this.emptyFill(6,startRemito)
                    const sql = `INSERT INTO public.glpi_sgp_envio(
                    lentrega_id, dependencia, exported,fecha_created, nro_remito, tanda, estado,ultima_mod,cue,fortificado)
                    VALUES (${envio.entregaId}, '${envio.desglose}', false, NOW(),'${nro_remito}', ${tanda}, 'PENDIENTE', NOW(),${envio.cue},${envio.fortificado}) RETURNING envio_id;`
                    const sqlCreated = `UPDATE public.glpi_sgp_desgloses SET ${envio.fortificado ? `sent_al=true` : `sent_cl=true`} WHERE cue = ${envio.cue};`
                    if(envio.entregaId && envio.desglose && envio.cue) {
                        const envId = (await conn.query(sql)).rows[0]["envio_id"]
                        console.log("ID = "+envId  + " -- LUGAR = " + envio.entregaId +" -- REMITO = "+startRemito+ " -- TIPO = "+(envio.fortificado ? "AL" : "CL"))
                        for (const prod of envio.detalles) {
                            const sql2 = `INSERT INTO public.glpi_sgp_envio_details(
                            envio_id, kilos, cajas, bolsas, raciones, des, tanda, unidades, unit_caja, caja_palet,nro_remito)
                            VALUES (${envId}, ${prod.kilos}, ${prod.cajas}, ${prod.bolsas}, ${prod.raciones},'${prod.des}', ${tanda}, ${prod.unidades}, ${prod.unit_caja},${prod.caja_palet},'${nro_remito}');`
                            await conn.query(sql2)
                            prodCreated++
                        }
                        await conn.query(sqlCreated)
                        created++
                    }
                    else console.log(envio)

                }
            }
            const updateRemito = `UPDATE public.glpi_sgp_config SET payload=${startRemito} WHERE config_id = 1;`
            log.desgloses = created
            log.nro_tanda = tanda
            //Si se updatea los remitos, lo hace
            if(data.update) {
                await conn.query(updateRemito)
                log.remitos = startRemito-startRemitoConst
            }
            //se crea el log
            const sqlLog = `INSERT INTO public.glpi_sgp_tanda_log(nro_tanda, remitos, remitos_iniciales, desgloses, pv) VALUES (${log.nro_tanda}, ${log.remitos}, ${log.remitos_iniciales}, ${log.desgloses}, ${log.pv});`
            await conn.query(sqlLog)
            //cierre
            await conn.end()
            const parsedRemitos = this.emptyFill(5,pv)+"-"+this.emptyFill(6,startRemitoConst) + " <-> "+this.emptyFill(5,pv)+"-"+this.emptyFill(6,startRemito)
            return "Tanda: "+tanda+" - Envios creados: "+created+ " - Productos agregados: "+ prodCreated+" - Remitos Creados: "+(startRemito-startRemitoConst)+" - Actualizo remitos: "+data.update+` - (${parsedRemitos}) Fin de talonario en: ${finTalo - (startRemito)} remitos.`
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    //Traer para ruta
    async getRuta (start: string, end: string) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const data1: IDesglosesRuta[] = (await conn.query(rutaSql(start,end))).rows
            const data2: IRemitoRuta[] = (await conn.query(rutaSqlRemito(start,end))).rows
            const totales: ITotalRutas[] = (await conn.query(rutaSqlTotales(start,end))).rows
            const totalesParsed: IRutaTotalsParsed[] = []
            totales.forEach(t => {
                if(parseInt(t.ucaja) > 0) {
                    const numberDiv = parseInt(t.ucaja)
                    const cajaN = parseInt(t.cajas)
                    const bolsasN = parseInt(t.bolsas)
                    const kilosN = parseFloat(t.kilos).toFixed(2)
                    const paletDiv = parseInt(t.palet)
                    //Nuevo
                        const palet = Math.floor(cajaN / paletDiv)
                        let cajasTotales = Math.floor(cajaN - (palet * paletDiv))
                        cajasTotales = Math.floor(cajasTotales + (bolsasN / numberDiv))
                        const totalUnCjP = palet * paletDiv * numberDiv + cajasTotales * numberDiv
                        const totalBolsas = (cajaN * numberDiv + bolsasN) - totalUnCjP
                        const data: IRutaTotalsParsed = {
                        des: t.des,
                        cajas: cajasTotales,
                        bolsas: totalBolsas,
                        ucaja: numberDiv,
                        kilos: parseFloat(kilosN),
                        palet: palet,
                        caja_palet: paletDiv
                    }
                    totalesParsed.push(data)
                }
                else {
                    const bolsasN = parseInt(t.bolsas)
                    const kilosN = parseFloat(t.kilos).toFixed(2)
                    const paletDiv = parseInt(t.palet)
                    const palet = Math.floor(bolsasN / paletDiv)
                    const totalUnCjP = palet * paletDiv
                    const totalBolsas = bolsasN - totalUnCjP
                    const data: IRutaTotalsParsed = {
                        des: t.des,
                        cajas: 0,
                        bolsas: totalBolsas,
                        ucaja: 0,
                        kilos: parseFloat(kilosN),
                        palet: palet,
                        caja_palet: paletDiv
                    }
                    totalesParsed.push(data)
                }

            });
            const response = {
                desgloses: data1,
                remitos: data2,
                totales: totalesParsed
            }
            await conn.end()
            return response

        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async getRutaCustom (remitos: string[]) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const data1: IDesglosesRuta[] = (await conn.query(rutaSqlCustom(remitos))).rows
            const data2: IRemitoRuta[] = (await conn.query(rutaSqlRemitoCustom(remitos))).rows
            const totales: ITotalRutas[] = (await conn.query(rutaSqlTotalesCustom(remitos))).rows
            const totalesParsed: IRutaTotalsParsed[] = []
            totales.forEach(t => {
                if(parseInt(t.ucaja) > 0) {
                    const numberDiv = parseInt(t.ucaja)
                    const cajaN = parseInt(t.cajas)
                    const bolsasN = parseInt(t.bolsas)
                    const kilosN = parseFloat(t.kilos).toFixed(2)
                    const paletDiv = parseInt(t.palet)
                    //Nuevo 
                    const palet = Math.floor(cajaN / paletDiv)
                    let cajasTotales = Math.floor(cajaN - (palet * paletDiv))
                    cajasTotales = Math.floor(cajasTotales + (bolsasN / numberDiv))
                    const totalUnCjP = palet * paletDiv * numberDiv + cajasTotales * numberDiv
                    const totalBolsas = (cajaN * numberDiv + bolsasN) - totalUnCjP
                    const data: IRutaTotalsParsed = {
                        des: t.des,
                        cajas: cajasTotales,
                        bolsas: totalBolsas,
                        ucaja: numberDiv,
                        kilos: parseFloat(kilosN),
                        palet: palet,
                        caja_palet: paletDiv
                    }
                    totalesParsed.push(data)
                }
                else {
                    const bolsasN = parseInt(t.bolsas)
                    const kilosN = parseFloat(t.kilos).toFixed(2)
                    const paletDiv = parseInt(t.palet)
                    const palet = Math.floor(bolsasN / paletDiv)
                    const totalUnCjP = palet * paletDiv
                    const totalBolsas = bolsasN - totalUnCjP
                    const data: IRutaTotalsParsed = {
                        des: t.des,
                        cajas: 0,
                        bolsas: totalBolsas,
                        ucaja: 0,
                        kilos: parseFloat(kilosN),
                        palet: palet,
                        caja_palet: paletDiv
                    }
                    totalesParsed.push(data)
                }

            });
            const response = {
                desgloses: data1,
                remitos: data2,
                totales: totalesParsed
            }
            await conn.end()
            return response

        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    //Trae los envios por una tanda especifica

    async getTandaEnvios (start: string, end: string) {
        const conn = clientReturner()
        try {
            const range = rangeReturner(start, end)
            await conn.connect()
            const sql = `SELECT * FROM public.glpi_sgp_envio e INNER JOIN public.glpi_sgp_lentrega l on e.lentrega_id = l.lentrega_id where ${range} ORDER BY e.nro_remito ASC;`
            const sql2 = `SELECT * FROM public.glpi_sgp_envio_details WHERE ${range};`
            const envios: IrequestEnvio[] = (await conn.query(sql)).rows
            const detalles: IDetalleEnvio[] = (await conn.query(sql2)).rows
            envios.forEach(env => {
                env.detalles = detalles.filter((d) => d.envio_id === env.envio_id)
                
            });
            await conn.end()
            return envios
            
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async getTandaEnviosCustom (remitos: string[]) {
        const conn = clientReturner()
        try {
            const range = customRemitosReturner(remitos)
            await conn.connect()
            const sql = `SELECT * FROM public.glpi_sgp_envio e INNER JOIN public.glpi_sgp_lentrega l on e.lentrega_id = l.lentrega_id where ${range} ORDER BY e.nro_remito ASC;`
            const sql2 = `SELECT * FROM public.glpi_sgp_envio_details WHERE ${range};`
            const envios: IrequestEnvio[] = (await conn.query(sql)).rows
            const detalles: IDetalleEnvio[] = (await conn.query(sql2)).rows
            envios.forEach(env => {
                env.detalles = detalles.filter((d) => d.envio_id === env.envio_id)
                
            });
            await conn.end()
            return envios
            
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async getActasConformidad (start: string, end: string) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const data: IConformidad[] = (await conn.query(conformidadSql(start, end))).rows
            await conn.end()
            return data
            
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    async getActasConformidadCustom (remitos: string[]) {
        const conn = clientReturner()
        try {
            await conn.connect()
            const data: IConformidad[] = (await conn.query(conformidadSqlCustom(remitos))).rows
            await conn.end()
            return data
            
        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }

    //Crea un informe de la tanda
    async createInformeTandaEnvio (range: string, dias: number): Promise<string[]> {
        const conn = clientReturner()
        try {
            await conn.connect()
            const sqlRm = `select e.nro_remito from glpi_sgp_envio e where ${range} group by e.nro_remito order by e.nro_remito;`
            const sqlSumatoria = `select SUM(e.kilos) as kilos, SUM(e.cajas) as cajas, SUM(e.bolsas) as bolsas from glpi_sgp_envio_details e where ${range};`
            const sqlCountDesgloses = `select COUNT(*) from glpi_sgp_envio e where ${range};`
            const sqlRatios = `select e.des,e.unit_caja, e.caja_palet from glpi_sgp_envio_details e where ${range} group by e.des,e.unit_caja, e.caja_palet;`
            const remitos: string[] = (await conn.query(sqlRm)).rows
            const ratios: IinformeEnvioRatios[] = (await conn.query(sqlRatios)).rows
            const count: IinformeEnvioRatios[] = (await conn.query(sqlCountDesgloses)).rows[0]["count"]
            const sum: IinformeSum = (await conn.query(sqlSumatoria)).rows[0]
            let txt: string[] = []
            txt.push(`INFORME DE REMITOS ----------------`)
            txt.push(" ")
            txt.push(`Remitos Creado (${remitos.length}): `)
            txt.push(" ")
            remitos.forEach(re => {
                txt.push(re["nro_remito"])
                txt.push(" ")
            });
            txt.push("Cantidad de desgloses: "+count)
            txt.push(" ")
            txt.push("Cantidad de dias habiles: "+dias)
            txt.push(" ")
            txt.push("Ratios de los insumos: ")
            txt.push(" ")
            ratios.forEach(r => {
                txt.push("Insumo: "+r.des+" ---> Cantidad en una caja: "+r.unit_caja+" ---> Cantidad de cajas en palet: "+r.caja_palet)
                txt.push(" ")
            });
            txt.push("Sumatoria de kilos, cajas y bolsas:")
            txt.push(" ")
            txt.push("Kilos: "+sum.kilos)
            txt.push("Cajas: "+sum.cajas)
            txt.push( "Bolsas: "+sum.bolsas)
            await conn.end()
            return txt
        } catch (error) {
            await conn.end()
            console.log(error)
            return ["ERROR AL CREAR INFORME"]
        }
    }

    async createRemitosData (start: string, end: string) {
        const conn = clientReturner()
        const range = rangeReturner(start, end)
        const sqlRemitos = txtSql(range)
        
        const sqlDes = `select e.nro_remito, count(*) from glpi_sgp_envio e where e.${range} group by e.nro_remito;`
        const sqlCai = "select payload from glpi_sgp_config where config_id = 4;"
        const sqlRtVenc = "select payload from glpi_sgp_config where config_id = 5;"
        try {
            await conn.connect()
            const data1: IEntregaDetalleTxt[] = (await conn.query(sqlRemitos)).rows
            const desgloses: desgloseCount[] = (await conn.query(sqlDes)).rows
            const cai = await (await conn.query(sqlCai)).rows[0]["payload"]
            const fech_ven = await (await conn.query(sqlRtVenc)).rows[0]["payload"]
            const fechaParsed = `${fech_ven.slice(0, 2)}/${fech_ven.slice(2, 4)}/${fech_ven.slice(4, 8)}`
            let aux = ""
            const arrayRemitos: IRemitoEnvio[] = []
            for(const data of data1) {
                if(data.nro_remito !== aux) {
                    const sqlEntrega = `SELECT localidad, direccion,descripcion FROM public.glpi_sgp_lentrega where lentrega_id = ${data.lentrega_id};`
                    const lugar: IRemitoEntrega = await (await conn.query(sqlEntrega)).rows[0]
                    const detallesToAdd: IDetalleEnvioTxt[] = []
                    data1.forEach(de => {
                        if(de.nro_remito === data.nro_remito) {
                            const insumoArray = de.descripcion.split("-")
                            const detalle: IDetalleEnvioTxt = {
                                descripcion: insumoArray[insumoArray.length - 1],
                                total_raciones: parseInt(de.total_raciones),
                                total_kilos: parseFloat(parseFloat(de.total_kilos).toFixed(2)),
                                total_bolsas: parseInt(de.total_bolsas),
                                total_cajas: parseInt(de.total_cajas),
                                total_unidades: parseInt(de.total_unidades),
                                unit_caja: parseInt(de.unit_caja)
                            }
                            detallesToAdd.push(detalle)
                        }
                    });
                    let desglosesCount = 0
                    desgloses.forEach(desc => {
                        if(desc.nro_remito === data.nro_remito) desglosesCount = desc.count;
                    });
                    const fila: IRemitoEnvio = {
                        nro_remito: data.nro_remito,
                        le_des: lugar.descripcion,
                        le_direccion: lugar.direccion,
                        le_localidad: lugar.localidad,
                        detalles: detallesToAdd,
                        cant_desgloses: desglosesCount,
                        fcha_venc: fechaParsed,
                        cai: cai
                    }
                    arrayRemitos.push(fila)
                }
                aux = data.nro_remito
            }
            await conn.end()
            const parsedRemitos = arrayRemitos.map(r => this.totalReturnerOwn(r))
            return parsedRemitos

        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    async createRemitosDataCustom (remitos: string[]) {
        const conn = clientReturner()
        const range = customRemitosReturner(remitos)
        const sqlRemitos = txtSql(range)
        const sqlDes = `select e.nro_remito, count(*) from glpi_sgp_envio e where e.${range} group by e.nro_remito;`
        const sqlCai = "select payload from glpi_sgp_config where config_id = 4;"
        const sqlRtVenc = "select payload from glpi_sgp_config where config_id = 5;"
        try {
            await conn.connect()
            const data1: IEntregaDetalleTxt[] = (await conn.query(sqlRemitos)).rows
            const desgloses: desgloseCount[] = (await conn.query(sqlDes)).rows
            const cai = await (await conn.query(sqlCai)).rows[0]["payload"]
            const fech_ven = await (await conn.query(sqlRtVenc)).rows[0]["payload"]
            const fechaParsed = `${fech_ven.slice(0, 2)}/${fech_ven.slice(2, 4)}/${fech_ven.slice(4, 8)}`
            let aux = ""
            const arrayRemitos: IRemitoEnvio[] = []
            for(const data of data1) {
                if(data.nro_remito !== aux) {
                    const sqlEntrega = `SELECT localidad, direccion,descripcion FROM public.glpi_sgp_lentrega where lentrega_id = ${data.lentrega_id};`
                    const lugar: IRemitoEntrega = await (await conn.query(sqlEntrega)).rows[0]
                    const detallesToAdd: IDetalleEnvioTxt[] = []
                    data1.forEach(de => {
                        if(de.nro_remito === data.nro_remito) {
                            const insumoArray = de.descripcion.split("-")
                            const detalle: IDetalleEnvioTxt = {
                                descripcion: insumoArray[insumoArray.length - 1],
                                total_raciones: parseInt(de.total_raciones),
                                total_kilos: parseFloat(parseFloat(de.total_kilos).toFixed(2)),
                                total_bolsas: parseInt(de.total_bolsas),
                                total_cajas: parseInt(de.total_cajas),
                                total_unidades: parseInt(de.total_unidades),
                                unit_caja: parseInt(de.unit_caja)
                            }
                            detallesToAdd.push(detalle)
                        }
                    });
                    let desglosesCount = 0
                    desgloses.forEach(desc => {
                        if(desc.nro_remito === data.nro_remito) desglosesCount = desc.count;
                    });
                    const fila: IRemitoEnvio = {
                        nro_remito: data.nro_remito,
                        le_des: lugar.descripcion,
                        le_direccion: lugar.direccion,
                        le_localidad: lugar.localidad,
                        detalles: detallesToAdd,
                        cant_desgloses: desglosesCount,
                        fcha_venc: fechaParsed,
                        cai: cai
                    }
                    arrayRemitos.push(fila)
                }
                aux = data.nro_remito
            }
            await conn.end()
            const parsedRemitos = arrayRemitos.map(r => this.totalReturnerOwn(r))
            return parsedRemitos

        } catch (error) {
            await conn.end()
            console.log(error)
            return error
        }
    }
    //Crea las lineas de texto para los dos TXTs necesarios para la importacion
    async createTxtEnvio (start: string, end: string, dias: number) {
        const conn = clientReturner()
        const range = rangeReturner(start, end)
        const sqlRemitos = txtSql(range)
        const sqlDes = `select e.nro_remito, count(*) from glpi_sgp_envio e where e.${range} group by e.nro_remito;`
        try {
            await conn.connect()
            const data1: IEntregaDetalleTxt[] = (await conn.query(sqlRemitos)).rows
            const desgloses: desgloseCount[] = (await conn.query(sqlDes)).rows
            let aux = ""
            const arrayRemitos: IRemitoInd[] = []
            data1.forEach(data => {
                if(data.nro_remito !== aux) {
                    const detallesToAdd: IDetalleEnvioTxt[] = []
                    data1.forEach(de => {
                        if(de.nro_remito === data.nro_remito) {
                            const detalle: IDetalleEnvioTxt = {
                                descripcion: de.descripcion,
                                total_raciones: parseInt(de.total_raciones),
                                total_kilos: parseFloat(parseFloat(de.total_kilos).toFixed(2)),
                                total_bolsas: parseInt(de.total_bolsas),
                                total_cajas: parseInt(de.total_cajas),
                                total_unidades: parseInt(de.total_unidades),
                                unit_caja: parseInt(de.unit_caja)
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
                aux = data.nro_remito
            });
            const response = {
                cabecera: this.createCabeceraTxt(arrayRemitos),
                items: this.createItemTxt(arrayRemitos,dias),
                informe: await this.createInformeTandaEnvio(range,dias)
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
            line += fillEmptyTxt("",1,false,false,false)
            //act stock
            line += fillEmptyTxt("S",1,false,false,false)
            //33 - 37
            blank2.forEach((s) => {
                line += fillEmptyTxt("",s,true,true,false)    
            });
            //no disp
            line += fillEmptyTxt("",1,true,true,false)
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

    private totalReturner (remito: IRemitoInd): IRemitoInd {
        const detalles = remito.detalles
        detalles.forEach(de => {
            const numberDiv = de.unit_caja
            if(numberDiv){
                de.total_cajas = de.total_bolsas >= numberDiv ? Math.floor(de.total_cajas + de.total_bolsas / numberDiv) : de.total_cajas
                de.total_bolsas = de.total_bolsas % numberDiv
            }
            else {
                de.total_cajas = 0
                de.total_bolsas = de.total_bolsas 
            }

        });
        return remito
    }
    private totalReturnerOwn (remito: IRemitoEnvio): IRemitoEnvio {
        const detalles = remito.detalles
        detalles.forEach(de => {
            const numberDiv = de.unit_caja
            if(numberDiv){
                de.total_cajas = de.total_bolsas >= numberDiv ? Math.floor(de.total_cajas + de.total_bolsas / numberDiv) : de.total_cajas
                de.total_bolsas = de.total_bolsas % numberDiv
            }
            else {
                de.total_cajas = 0
                de.total_bolsas = de.total_bolsas 
            }

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
                line += fillEmptyTxt("RIA",3,false,true,false)
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
                line2 += fillEmptyTxt(`Contiene: Cajas ${de.total_cajas}-Bolsas ${de.total_bolsas}-Rac ${de.total_raciones}`,50,false,true,false)
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

                }
            });

        }
        return cabeceraLines
    }
    

}
