import { IsNotEmpty, IsNumber, IsString, IsArray } from "class-validator";

export default class pedidoDto {
    @IsString()
    @IsNotEmpty()
    state: 'Pendiente' | 'Aprobado' | 'Cancelado' | 'Rechazado' | 'Entregado'

    @IsNumber() 
    @IsNotEmpty()
    numero: number

    @IsString()
    @IsNotEmpty()
    date_requested: string

    @IsString()
    @IsNotEmpty()
    requester: string

    @IsString()
    @IsNotEmpty()
    cco: string

    @IsArray()
    @IsNotEmpty()
    insumos: []
}