import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export default class clienteDto {
    @IsNumber()
    @IsNotEmpty()
    client_id: number

    @IsString()
    @IsNotEmpty()
    dateStart: string

    @IsString()
    @IsNotEmpty()
    dateEnd: string
}