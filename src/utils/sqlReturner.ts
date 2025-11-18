import customRemitosReturner from "./customRemitosReturner"
import monthRangeReturner from "./monthRangeReturner"
import rangeReturner from "./rangeReturner"

export function txtSql (range: string) : string {
    const sql = `SELECT e.lentrega_id,e.dias, e.nro_remito,d.des AS descripcion,d.unit_caja,SUM(d.raciones) AS total_raciones,SUM(d.kilos) AS total_kilos,SUM(d.bolsas) AS total_bolsas,SUM(d.cajas) AS total_cajas,SUM(d.unidades) AS total_unidades
    FROM glpi_sgp_envio e JOIN glpi_sgp_envio_details d ON e.envio_id = d.envio_id WHERE e.${range} GROUP BY e.lentrega_id,e.nro_remito,d.des,d.unit_caja,e.dias ORDER BY e.nro_remito;`
    return sql
}
export function rutaSql (start: string, end: string) : string {
    const range = rangeReturner(start,end)
    return `SELECT e.nro_remito,e.dependencia,l.localidad,l.direccion FROM glpi_sgp_envio e JOIN glpi_sgp_lentrega l ON e.lentrega_id = l.lentrega_id
    WHERE e.${range} GROUP BY e.lentrega_id,e.nro_remito,e.dependencia,l.localidad,l.direccion ORDER BY e.nro_remito;`
}

export function rutaSqlCustom (remitos: string[]) : string {
    const range = customRemitosReturner(remitos)
    return `SELECT e.nro_remito,e.dependencia,l.localidad,l.direccion FROM glpi_sgp_envio e JOIN glpi_sgp_lentrega l ON e.lentrega_id = l.lentrega_id
    WHERE e.${range} GROUP BY e.lentrega_id,e.nro_remito,e.dependencia,l.localidad,l.direccion ORDER BY e.nro_remito;`
}

export function rutaSqlRemito (start: string, end: string):string {
    const range = rangeReturner(start,end)
    return `select e.nro_remito, l.localidad, l.completo, l.direccion from glpi_sgp_envio e JOIN glpi_sgp_lentrega l on e.lentrega_id = l.lentrega_id where ${range} group by nro_remito,l.localidad, l.direccion, l.completo order by nro_remito;`
}
export function rutaSqlRemitoCustom (remitos: string[]):string {
    const range = customRemitosReturner(remitos)
    return `select e.nro_remito, l.localidad, l.completo, l.direccion from glpi_sgp_envio e JOIN glpi_sgp_lentrega l on e.lentrega_id = l.lentrega_id where ${range} group by nro_remito,l.localidad, l.direccion, l.completo order by nro_remito;`
}

export function rutaSqlTotales (start: string, end: string) {
    const range = rangeReturner(start,end)
    return `SELECT d.des, SUM(d.kilos) as kilos, SUM(d.cajas) as Cajas ,SUM(d.bolsas) as Bolsas,d.unit_caja as UCaja, d.caja_palet as Palet from glpi_sgp_envio_details d where ${range} group by d.des,d.unit_caja,d.caja_palet;`
}
export function rutaSqlTotalesCustom (remitos: string[]) {
    const range = customRemitosReturner(remitos)
    return `SELECT d.des, SUM(d.kilos) as kilos, SUM(d.cajas) as Cajas ,SUM(d.bolsas) as Bolsas,d.unit_caja as UCaja, d.caja_palet as Palet from glpi_sgp_envio_details d where ${range} group by d.des,d.unit_caja,d.caja_palet;`
}

export function conformidadSql (start: string, end: string) {
    const range = rangeReturner(start,end)
    return `select e.nro_remito, l.completo, l.localidad from glpi_sgp_envio e JOIN glpi_sgp_lentrega l on l.lentrega_id = e.lentrega_id where ${range} group by e.nro_remito, l.completo,l.localidad;`
}

export function conformidadSqlCustom (remitos: string[]) {
    const range = customRemitosReturner(remitos)
    return `select e.nro_remito, l.completo, l.localidad from glpi_sgp_envio e JOIN glpi_sgp_lentrega l on l.lentrega_id = e.lentrega_id where ${range} group by e.nro_remito, l.completo,l.localidad;`
}

export function deleteTandaSQL (tanda: number) {
    console.log("Eliminando Tanda")
    return `DELETE FROM public.glpi_sgp_envio WHERE tanda = ${tanda};`
}

export function deleteTandaLogSQL (tanda: number) {
    console.log("Eliminando log de tanda")
    return `DELETE FROM public.glpi_sgp_tanda_log WHERE nro_tanda = ${tanda};`
}

export function gobackRemitoSQL (tanda: number) {
    console.log("Volviendo atras Remito")
    return `UPDATE public.glpi_sgp_config SET payload=(SELECT payload FROM public.glpi_sgp_config WHERE config_id= 1 ) - (SELECT remitos FROM public.glpi_sgp_tanda_log WHERE nro_tanda = ${tanda}) WHERE config_id= 1;`
}

export function txtOrders (month: number, year: number) {
    return `select d.insumo_des,d.amount,o.service_id,o.numero,o.date_delivered from glpi_sgp_order_detail d join glpi_sgp_orders o on d.order_id = o.order_id where ${monthRangeReturner(month,year)};`
}
export function txtOrdersRange (date1: string, date2: string) {
    return `select d.detail_id,d.insumo_des,d.amount,o.service_id,o.numero,o.date_delivered from glpi_sgp_order_detail d join glpi_sgp_orders o on d.order_id = o.order_id where o.state = 'Entregado' d.exported = false and o.date_delivered BETWEEN '${date1}' and '${date2}';`
}

export function deglosesSQL (departamento: string, fortificado: number) {
    if(fortificado > 0) {
        return `select d.cue,d.lentrega_id,l.localidad,l.completo,d.des,rac_cl,rac_al from glpi_sgp_desgloses d join glpi_sgp_lentrega l on d.lentrega_id = l.lentrega_id where l.departamento = '${departamento}' and sent_al = false and rac_al IS NOT NULL and rac_al > 0;`
    }
    else {
        return `select d.cue,d.lentrega_id,l.localidad,l.completo,d.des,rac_cl,rac_al from glpi_sgp_desgloses d join glpi_sgp_lentrega l on d.lentrega_id = l.lentrega_id where l.departamento = '${departamento}' and sent_cl = false and rac_cl IS NOT NULL and rac_cl > 0;`
    }
}

export function cabecerasSQL (departamento: string) {
    return `select l.lentrega_id, l.completo from glpi_sgp_lentrega l where l.departamento = '${departamento}';`
}

export function verRemitosSQL (limit: string) {
    return `SELECT e.nro_remito, e.ultima_mod, e.estado,l.departamento,l.localidad,l.completo,e.dias,e.fortificado,e.fecha_created as fecha,(SELECT count(*) FROM public.glpi_sgp_remito_reporte where remito = e.nro_remito) as reportes, (SELECT factura FROM glpi_sgp_remito_facturacion where remito = e.nro_remito),(SELECT fecha FROM glpi_sgp_remito_log where remito = e.nro_remito and estado = 'ENTREGADO') as fecha_entrega FROM public.glpi_sgp_envio e  JOIN public.glpi_sgp_lentrega l ON l.lentrega_id = e.lentrega_id  GROUP BY e.fortificado,e.nro_remito,e.estado,e.lentrega_id,l.departamento,l.localidad,l.completo,e.ultima_mod,e.dias,e.fecha_created ORDER BY nro_remito DESC LIMIT ${limit};`
}
export function verRemitoUniqSQL (remito: string) {
    return `SELECT e.nro_remito, e.ultima_mod, e.estado,l.departamento,l.localidad,l.completo,e.dias,e.fortificado,e.fecha_created as fecha,(SELECT count(*) FROM public.glpi_sgp_remito_reporte where remito = e.nro_remito) as reportes, (SELECT factura FROM glpi_sgp_remito_facturacion where remito = e.nro_remito),(SELECT fecha FROM glpi_sgp_remito_log where remito = e.nro_remito and estado = 'ENTREGADO') as fecha_entrega FROM public.glpi_sgp_envio e  JOIN public.glpi_sgp_lentrega l ON l.lentrega_id = e.lentrega_id WHERE e.nro_remito = '${remito}' GROUP BY e.fortificado,e.nro_remito,e.estado,e.lentrega_id,l.departamento,l.localidad,l.completo,e.ultima_mod,e.dias,e.fecha_created;`
}

export function estadoRemitosSQL (estado: string, remito:string) {
    return `UPDATE public.glpi_sgp_envio SET estado='${estado}',ultima_mod=NOW() WHERE nro_remito='${remito}' RETURNING tanda;`
}

export function estadoRemitoLogSQL (tanda: number,estado: string,remito: string, user: number,date?:string) {
    if(date) {
        return `INSERT INTO public.glpi_sgp_remito_log(remito, estado, fecha, tanda,deleted,user_id) VALUES ('${remito}', '${estado}', '${date}', ${tanda},false,${user});`
    }
    else {
        return `INSERT INTO public.glpi_sgp_remito_log(remito, estado, fecha, tanda,deleted,user_id) VALUES ('${remito}', '${estado}',NOW() , ${tanda},false,${user});`
    }
}

export function deleteRemitoLogSQL (tanda: number) {
    return `UPDATE public.glpi_sgp_remito_log SET deleted=true WHERE tanda = ${tanda};`
}

export function logRemitosSQL (estado: string, remito:string) {
    return `UPDATE public.glpi_sgp_envio SET estado='${estado}',ultima_mod=NOW() WHERE nro_remito='${remito}';`
}

export function createReporteSQL (titulo: string, des: string,remito: string, userId: number) {
    return `INSERT INTO public.glpi_sgp_remito_reporte(remito, titulo, des, fecha, user_id) VALUES ('${remito}', '${titulo}', '${des}', NOW(), ${userId});`
}

export function getRemitoSQL (remito: string) {
    return `SELECT * FROM public.glpi_sgp_remito_reporte where remito = '${remito}' order by fecha ASC;`
}

export function getRemitoRatiosFacSQL (remito: string) {
    return `select des, SUM(raciones) from glpi_sgp_envio_details where nro_remito = '${remito}' and des like '%9000%'  or nro_remito = '${remito}' and des like '%9001%'  or nro_remito = '${remito}' and des like '%9021%'  or nro_remito = '${remito}' and des like '%9013%' or nro_remito = '${remito}' and des like '%9016%' group by des;`
}

export function createFacturaSQL (remito: string, raciones: number, fecha: string,factura:string) {
    return `INSERT INTO public.glpi_sgp_remito_facturacion(remito, raciones, fecha, fecha_created,factura) VALUES ('${remito}', ${raciones}, '${fecha}', NOW(),'${factura}');`
}

export function remitoDataFactSQL (remito: string) {
    return `select e.nro_remito,l.completo,l.localidad,l.departamento,e.fortificado from glpi_sgp_envio e JOIN glpi_sgp_lentrega l on e.lentrega_id = l.lentrega_id where e.nro_remito = '${remito}' group by e.nro_remito,l.completo,l.localidad,l.departamento,e.fortificado;`
}

export function movimientoSQL (date1: string, date2: string) {
    return `SELECT des as insumo, sum(raciones) as raciones, sum(unidades) as unidades FROM glpi_sgp_envio_details d JOIN glpi_sgp_envio e ON d.envio_id = e.envio_id where e.fecha_created BETWEEN '${date1}' and '${date2}' group by des order by des asc;`
}

export function movimientoFilteredSQL (date1: string, date2: string,estado: string) {
    return `SELECT des as insumo, sum(raciones) as raciones, sum(unidades) as unidades FROM glpi_sgp_envio_details d JOIN glpi_sgp_envio e ON d.envio_id = e.envio_id where e.estado = '${estado}' e.fecha_created BETWEEN '${date1}' and '${date2}' group by des order by des asc;`
}

export function totalInformeEnviosSQL () {
    return `select e.nro_remito,e.lentrega_id,l.completo,e.dependencia,e.fecha_created,e.estado,e.tanda,e.fortificado from glpi_sgp_envio e join glpi_sgp_lentrega l on e.lentrega_id = l.lentrega_id order by nro_remito asc;`
}