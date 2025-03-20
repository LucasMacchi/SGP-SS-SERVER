import { IsNotEmpty, IsString } from "class-validator";

export default class loginDto {
    @IsNotEmpty()
    @IsString()
    username: string;
}