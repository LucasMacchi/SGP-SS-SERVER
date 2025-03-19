export interface IPedido {
    state: 'Pendiente' | 'Aprobado' | 'Cancelado' | 'Rechazado' | 'Entregado',
    numero?: number,
    date_aproved?: string,
    date_requested: string,
    date_delivered?: string,
    requester: string,
    cco: string,
    insumos: IInsumo[]
}
export interface IInsumo {
    cod: number,
    name: string,
    amount: number
}
export interface IUser {
    username: string,
    first_name: string,
    last_name: string,
    rol: number,
    activated: boolean
}