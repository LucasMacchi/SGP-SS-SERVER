import { IsNotEmpty, IsNumber, IsString, IsArray, IsBoolean } from "class-validator";

export interface IInsumo {
    insumo_des: string,
    amount: number,
    cod_insumo?: number
}

export default class pedidoDto {

    @IsNumber()
    @IsNotEmpty()
    usuario_id: number

    @IsString()
    @IsNotEmpty()
    requester: string

    @IsNumber()
    @IsNotEmpty()
    service_id: number

    @IsNumber()
    @IsNotEmpty()
    client_id: number

    @IsBoolean()
    prov: boolean

    @IsString()
    prov_des: string

    @IsArray()
    @IsNotEmpty()
    insumos: IInsumo[]
}