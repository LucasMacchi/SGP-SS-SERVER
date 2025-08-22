import { IsNotEmpty, IsNumber, IsString } from "class-validator"


export class editCantidadDto {
    @IsNumber()
    @IsNotEmpty()
    detail_id: number

    @IsNumber()
    @IsNotEmpty()
    cantidad: number

    @IsString()
    @IsNotEmpty()
    column: string
}