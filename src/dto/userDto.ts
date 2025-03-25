import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsEmail } from "class-validator";

export default class registerUser {
    
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

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
}