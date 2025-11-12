import { IsNotEmpty, IsString,IsArray } from "class-validator"

export class patchEstadosRemitosDto {
    @IsArray()
    @IsNotEmpty()
    remitos: string[]

    @IsString()
    @IsNotEmpty()
    estado: string
}