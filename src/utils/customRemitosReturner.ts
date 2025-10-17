export default function (remitos: string[]){
    let lines = ""
    remitos.forEach((rt,i) => {
        lines += i === 0 ? "'"+rt+"'" : ",'"+rt+"'"
    });
    return `nro_remito IN (${lines})`
}