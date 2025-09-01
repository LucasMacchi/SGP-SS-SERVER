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

export interface IrequestEnvio {
    entregaId: number,
    desglose: string,
    leche: {
      kilos: number,
      cajas: number,
      bolsas: number,
      raciones: number
    },
    azucar: {
      kilos: number,
      cajas: number,
      bolsas: number,
      raciones: number
    },
    yerba: {
      kilos: number,
      cajas: number,
      bolsas: number,
      raciones: number
    },
    alfajores: {
      kilos: number,
      cajas: number,
      bolsas: number,
      raciones: number
    },
    galletitas: {
      kilos: number,
      cajas: number,
      bolsas: number,
      raciones: number
    }
}