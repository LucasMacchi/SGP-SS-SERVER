import { IsNotEmpty, IsString } from "class-validator";

export default class emailerDto {
    @IsNotEmpty()
    @IsString()
    to_send: string;

    @IsNotEmpty()
    @IsString()
    msg: string;

    @IsNotEmpty()
    @IsString()
    sender: string;
}