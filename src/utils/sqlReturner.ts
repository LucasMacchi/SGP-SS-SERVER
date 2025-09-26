import rangeReturner from "./rangeReturner"

export function txtSql (range: string) : string {
    const sql = `SELECT e.lentrega_id, e.nro_remito,d.des AS descripcion,d.unit_caja,SUM(d.raciones) AS total_raciones,SUM(d.kilos) AS total_kilos,SUM(d.bolsas) AS total_bolsas,SUM(d.cajas) AS total_cajas,SUM(d.unidades) AS total_unidades
    FROM glpi_sgp_envio e JOIN glpi_sgp_envio_details d ON e.envio_id = d.envio_id WHERE e.${range} GROUP BY e.lentrega_id,e.nro_remito,d.des,d.unit_caja ORDER BY e.nro_remito;`
    return sql
}
export function rutaSql (start: string, end: string) : string {
    const range = rangeReturner(start,end)
    return `SELECT e.nro_remito,e.dependencia,l.localidad,l.direccion FROM glpi_sgp_envio e JOIN glpi_sgp_lentrega l ON e.lentrega_id = l.lentrega_id
    WHERE e.${range} GROUP BY e.lentrega_id,e.nro_remito,e.dependencia,l.localidad,l.direccion ORDER BY e.nro_remito;`
}

export function rutaSqlRemito (start: string, end: string):string {
    const range = rangeReturner(start,end)
    return `select e.nro_remito, l.localidad, l.completo, l.direccion from glpi_sgp_envio e JOIN glpi_sgp_lentrega l on e.lentrega_id = l.lentrega_id where ${range} group by nro_remito,l.localidad, l.direccion, l.completo order by nro_remito;`
}

export function rutaSqlTotales (start: string, end: string) {
    const range = rangeReturner(start,end)
    return `SELECT d.des, SUM(d.kilos) as kilos, SUM(d.cajas) as Cajas ,SUM(d.bolsas) as Bolsas,d.unit_caja as UCaja, d.caja_palet as Palet from glpi_sgp_envio_details d where ${range} group by d.des,d.unit_caja,d.caja_palet;`
}

export function conformidadSql (start: string, end: string) {
    const range = rangeReturner(start,end)
    return `select e.nro_remito, l.completo, l.localidad from glpi_sgp_envio e JOIN glpi_sgp_lentrega l on l.lentrega_id = e.lentrega_id where ${range} group by e.nro_remito, l.completo,l.localidad;`
}

export function deleteTandaSQL (tanda: number) {
    return `DELETE FROM public.glpi_sgp_envio WHERE tanda = ${tanda};`
}

export function deleteTandaLogSQL (tanda: number) {
    return `DELETE FROM public.glpi_sgp_tanda_log WHERE nro_tanda = ${tanda};`
}

export function gobackRemitoSQL (tanda: number) {
    return `UPDATE public.glpi_sgp_config SET payload=(SELECT payload FROM public.glpi_sgp_config WHERE config_id= 1 ) - (SELECT remitos FROM public.glpi_sgp_tanda_log WHERE nro_tanda = ${tanda}) WHERE config_id= 1;`
}