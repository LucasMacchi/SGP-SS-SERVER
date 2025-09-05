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
  des: string,
  envio_id: number
}

export interface IrequestEnvio {
  entregaId: number,
  desglose: string,
  detalles: IDetalleEnvio[],
  envio_id?: number
}

export interface IEntregaDetalleTxt {
    lentrega_id: number,
    nro_remito: string,
    descripcion: string,
    total_raciones: string,
    total_kilos: string,
    total_bolsas: string,
    total_cajas: string
}

export interface IDetalleEnvioTxt {
    descripcion: string,
    total_raciones: number,
    total_kilos: number,
    total_bolsas: number,
    total_cajas: number
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