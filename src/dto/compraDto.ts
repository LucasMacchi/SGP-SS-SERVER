import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator"

export interface IinsumoCompra {
    descripcion: string,
    cantidad: number
}

export default class compraDto {
    @IsString()
    @IsNotEmpty()
    area: string

    @IsString()
    @IsNotEmpty()
    tipo: string

    @IsString()
    descripcion: string

    @IsString()
    @IsNotEmpty()
    lugar: string

    @IsString()
    @IsNotEmpty()
    fullname: string

    @IsString()
    @IsNotEmpty()
    proveedor: string

    @IsArray()
    @IsNotEmpty()
    compras: IinsumoCompra[]

    @IsString()
    date: string
}