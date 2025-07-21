import { IinsumoCompra } from "src/dto/compraDto"

export default function (insumos: IinsumoCompra[], comentario: string, descripcion: string, proveedor: string): string {

    let message = `Proveedor sugerido: ${proveedor}\n\nDescripcion proporcionada por el solicitante: \n${descripcion}\n\nProductos solicitados:\n`
    insumos.map((i) => message += i.descripcion+" - "+i.cantidad+"\n")
    message += "\nComentarios:\n"+comentario
    return message
}
