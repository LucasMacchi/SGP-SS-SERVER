import { IsNotEmpty, IsArray } from "class-validator";

export default class aproveDto {
    @IsArray()
    @IsNotEmpty()
    details: number[]
}