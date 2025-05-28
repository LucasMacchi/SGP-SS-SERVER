import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export default class addInsumo {
    @IsString()
    @IsNotEmpty()
    insumo: string

    @IsNumber()
    @IsNotEmpty()
    cantidad: number
}