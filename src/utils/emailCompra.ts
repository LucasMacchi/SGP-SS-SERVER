import { IinsumoCompra } from "src/dto/compraDto"

export default function (insumos: IinsumoCompra[], comentario: string, descripcion: string, proveedor: string): string {

    let message = `Proveedor sugerido: ${proveedor}\nDescripcion proporcionada por el solicitante: ${descripcion}\nProductos solicitados:\n`
    insumos.map((i) => message += i.descripcion+" - "+i.cantidad+"\n")
    message += "\nComentarios:\n"+comentario
    return message
}
