import { IsNotEmpty, IsArray, IsBoolean } from "class-validator";
import { IrequestEnvio } from "src/utils/interfaces";


export class createEnvioDto {
    @IsArray()
    @IsNotEmpty()
    enviados: IrequestEnvio[]

    @IsBoolean()
    @IsNotEmpty()
    update: boolean
}