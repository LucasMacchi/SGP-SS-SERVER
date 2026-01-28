import { IinsumoCompra } from "src/dto/compraDto"

const url = process.env.FRONT_END_URL ?? 'ERROR'

export default function (insumos: IinsumoCompra[], comentario: string, descripcion: string, proveedor: string, fechaSol: string, area: string, lugar: string,compra_id:number): string {
    const compraId = compra_id
    const completeUrl = url+"compras/"+compraId
    let message = `Proveedor sugerido: ${proveedor}\n\nArea: ${area}\n\Lugar: ${lugar}\n\nFecha a requerir: ${fechaSol}\n\nDescripcion proporcionada por el solicitante: \n${descripcion}\n\nProductos solicitados:\n`
    message += '\n'+completeUrl+'\n'
    insumos.map((i) => message += i.descripcion+" - "+i.cantidad+"\n")
    message += "\nComentarios:\n"+comentario
    return message
}
