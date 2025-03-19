import { IsNotEmpty, IsNumber, IsString, IsBoolean } from "class-validator";

export default class registerUser {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    first_name: string;

    @IsNotEmpty()
    @IsString()
    last_name: string

    @IsNotEmpty()
    @IsNumber()
    rol: number

    @IsBoolean()
    activated: boolean
}