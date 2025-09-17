export interface IPedido {
    state: 'Pendiente' | 'Aprobado' | 'Cancelado' | 'Rechazado' | 'Entregado' | 'Problemas',
    numero?: number,
    date_aproved?: string,
    date_requested: string,
    date_delivered?: string,
    requester: string,
    cco: string,
    insumos: IInsumo[]
}
export interface IInsumo {
    insumo_des: string,
    amount: number
}
export interface IUser {
    username: string,
    first_name: string,
    last_name: string,
    rol: number,
    activated: boolean
}
export interface IemailMsg {
    subject: string,
    msg: string
}

export interface IemailSQL {
    email: string
}
export interface IDetailChange {
    detail_id: number,
    amount: number
}
export interface IUserStolen {
    user: string,
    password: string
}

export interface IInsumorRes {
    insumo: string
}

export interface IOrderRemito {
    order_id: number,
    client_des: string,
    numero: number,
    service_des: string,
    localidad: string,
    insumos: IInsumo[]
}

export interface IDetalleEnvio {
  kilos: number,
  cajas: number,
  bolsas: number,
  raciones: number,
  unidades: number,
  unit_caja: number,
  caja_palet: number,
  des: string,
  envio_id: number
}

export interface IrequestEnvio {
  entregaId: number,
  desglose: string,
  detalles: IDetalleEnvio[],
  completo: string,
  envio_id?: number
}

export interface IEntregaDetalleTxt {
    lentrega_id: number,
    nro_remito: string,
    descripcion: string,
    total_raciones: string,
    total_kilos: string,
    total_bolsas: string,
    total_cajas: string,
    total_unidades: string,
    unit_caja: string,

}

export interface IDesglosesRuta {
    nro_remito: string,
    dependencia: string,
    localidad: string,
    direccion: string
}
export interface IRemitoRuta {
    nro_remito: string,
    localidad: string,
    direccion: string,
    completo: string
}
export interface ITotalRutas {
    des: string,
    cajas: string,
    bolsas: string,
    kilos: string,
    ucaja: string,
    palet: string
}
export interface IRutaTotalsParsed {
    des: string,
    cajas: number,
    bolsas: number,
    ucaja: number,
    kilos: number,
    palet: number
}


export interface IDetalleEnvioTxt {
    descripcion: string,
    total_raciones: number,
    total_kilos: number,
    total_bolsas: number,
    total_cajas: number,
    total_unidades: number,
    unit_caja: number
}

export interface IRemitoInd {
    remito: string,
    lentrega: number,
    detalles: IDetalleEnvioTxt[],
    desgloses: number
}

export interface IitemsTotal {
    tcajas: number,
    tbolsas: number,
    traciones: number
}

export interface desgloseCount {
    nro_remito: string,
    count: number
}

export interface IinformeEnvioRatios {
    des: string,
    unit_caja: number,
    caja_palet: number
}

export interface IinformeSum {
    kilos: string,
    cajas: string,
    bolsas: string
}

export interface IConformidad {
    nro_remito: string,
    completo: string,
    localidad: string
}