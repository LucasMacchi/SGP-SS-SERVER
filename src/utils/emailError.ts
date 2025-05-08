
export default function (msg: string, category: string, name: string): string {

    const message =
    `Usuario: ${name}\n\nCategoria: ${category}\n\nMensaje:\n${msg}`
    return message
}
