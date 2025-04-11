import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export default class reportDto {

    @IsString()
    @IsNotEmpty()
    descripcion: string

    @IsNumber()
    @IsNotEmpty()
    order_id: number

    @IsNumber()
    @IsNotEmpty()
    user_id: number

    @IsString()
    @IsNotEmpty()
    category: string

    @IsString()
    @IsNotEmpty()
    pedido_numero: string

    @IsString()
    @IsNotEmpty()
    nombre_completo: string

    @IsString()
    @IsNotEmpty()
    email: string
}