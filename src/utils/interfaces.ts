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
