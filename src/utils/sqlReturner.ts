export function txtSql (tanda: number) : string {
    const sql = `SELECT e.lentrega_id, e.nro_remito,d.des AS descripcion,d.unit_caja,SUM(d.raciones) AS total_raciones,SUM(d.kilos) AS total_kilos,SUM(d.bolsas) AS total_bolsas,SUM(d.cajas) AS total_cajas,SUM(d.unidades) AS total_unidades
    FROM glpi_sgp_envio e JOIN glpi_sgp_envio_details d ON e.envio_id = d.envio_id WHERE e.tanda = ${tanda} GROUP BY e.lentrega_id,e.nro_remito,d.des,d.unit_caja ORDER BY e.lentrega_id;`
    return sql
}
export function rutaSql (tanda: number) : string {
    return `SELECT e.nro_remito,e.dependencia,l.localidad,l.direccion FROM glpi_sgp_envio e JOIN glpi_sgp_envio_details d ON e.envio_id = d.envio_id JOIN glpi_sgp_lentrega l ON e.lentrega_id = l.lentrega_id
    WHERE e.tanda = ${tanda} GROUP BY e.lentrega_id,e.nro_remito,d.des,d.unit_caja,e.dependencia,l.localidad,l.direccion ORDER BY e.lentrega_id;`
}

export function rutaSqlRemito (tanda: number):string {
    return `select e.nro_remito, l.localidad, l.direccion from glpi_sgp_envio e JOIN glpi_sgp_lentrega l on e.lentrega_id = l.lentrega_id where tanda = ${tanda};`
}

export function rutaSqlTotales (tanda: number) {
    return `SELECT d.des, SUM(d.kilos) as kilos, SUM(d.cajas) as Cajas ,SUM(d.bolsas) as Bolsas,d.unit_caja as UCaja, d.caja_palet as Palet from glpi_sgp_envio_details d where tanda = ${tanda} group by d.des,d.unit_caja,d.caja_palet;`
}