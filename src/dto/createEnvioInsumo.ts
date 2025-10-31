import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export default class createEnvioInsumoDto {

    @IsString()
    @IsNotEmpty()
    des: string

    @IsNumber()
    @IsNotEmpty()
    caja_palet: number

    @IsNumber()
    @IsNotEmpty()
    unidades_caja: number

    @IsNumber()
    @IsNotEmpty()
    gr_racion: number

    @IsNumber()
    @IsNotEmpty()
    gr_total: number

    @IsNumber()
    @IsNotEmpty()
    racbolsa: number

    @IsNumber()
    @IsNotEmpty()
    raccaja: number

    @IsString()
    @IsNotEmpty()
    cod1: string

    @IsString()
    @IsNotEmpty()
    cod2: string
}
