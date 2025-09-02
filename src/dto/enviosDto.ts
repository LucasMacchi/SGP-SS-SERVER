import { IsNotEmpty, IsString, IsNumber, IsArray } from "class-validator";
import { IrequestEnvio } from "src/utils/interfaces";


export class createEnvioDto {
    @IsArray()
    @IsNotEmpty()
    enviados: IrequestEnvio[]

    @IsNumber()
    @IsNotEmpty()
    start_remito: number

    @IsNumber()
    @IsNotEmpty()
    pv_remito: number

    @IsNumber()
    no_lugarentrega: number

    @IsNumber()
    no_insumo: number

    @IsNumber()
    tanda: number
}