import { IsNotEmpty, IsArray } from "class-validator";


export class entradaDto {
    @IsArray()
    @IsNotEmpty()
    orders: string[]
}