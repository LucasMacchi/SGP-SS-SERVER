import { IsNotEmpty, IsString, IsArray } from "class-validator";

export default class createFacturacionDto {

    @IsString()
    @IsNotEmpty()
    factura: string

    @IsString()
    @IsNotEmpty()
    fechaF: string

    @IsArray()
    @IsNotEmpty()
    remitos: string[]

}
