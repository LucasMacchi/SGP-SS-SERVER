import { IsNotEmpty, IsNumber, IsString, IsArray } from "class-validator";

export default class rejectDto {
    @IsString()
    comment: string
}