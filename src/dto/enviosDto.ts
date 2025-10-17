import { IsNotEmpty, IsArray, IsBoolean } from "class-validator";
import { IrequestEnvio } from "src/utils/interfaces";


export class createEnvioDto {
    @IsArray()
    @IsNotEmpty()
    enviadosCL: IrequestEnvio[]

    @IsArray()
    @IsNotEmpty()
    enviadosAL: IrequestEnvio[]

    @IsBoolean()
    @IsNotEmpty()
    update: boolean
}