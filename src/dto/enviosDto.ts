import { IsNotEmpty, IsString, IsNumber, IsArray } from "class-validator";
import { IrequestEnvio } from "src/utils/interfaces";


export class createEnvioDto {
    @IsArray()
    @IsNotEmpty()
    enviados: IrequestEnvio[]

    @IsNumber()
    no_enviados: number
}