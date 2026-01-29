import { IinsumoCompra } from "src/dto/compraDto"

const url = process.env.FRONT_END_URL ?? 'ERROR'

export default function (insumos: IinsumoCompra[], comentario: string, descripcion: string, proveedor: string, fechaSol: string, area: string, lugar: string,compra_id:number): string {
    const compraId = compra_id
    const completeUrl = url+"compras/"+compraId
    let insumosStr = ""
    insumos.map((i) => insumosStr += `
    <tr>
        <th style="border: 1px solid">${i.descripcion}</th>
        <th style="border: 1px solid">${i.cantidad}</th>
    </tr>
    `)
    const html = `
    <html>
        <h3>Proveedor sugerido: ${proveedor}</h3>
        <h3>Area: ${area}</h3>
        <h3>Lugar: ${lugar}</h3>
        <h3>Fecha a requerir: ${fechaSol}</h3>
        <h3>Descipcion proporcionada por el solicitante: </h3>
        <p>${descripcion}</p>
        <h3>Productos Solicitados: </h3>
        <table>
            <tbody>
                <tr>
                    <th style="border: 1px solid">INSUMO/SERVICIO</th>
                    <th style="border: 1px solid">CANTIDAD</th>
                </tr>
                <tr>
                    ${insumosStr}
                </tr>
            </tbody>
        </table>
        <h3>Comentarios: </h3>
        <p>${comentario}</p>
        <a href="${completeUrl}">Link a la solicitud de compra</a>
    </html>
    `

    return html
}