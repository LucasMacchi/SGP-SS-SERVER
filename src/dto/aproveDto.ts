import { IsNotEmpty, IsArray, IsString } from "class-validator";
import { IDetailChange } from "src/utils/interfaces";

export default class aproveDto {
    @IsArray()
    @IsNotEmpty()
    details: number[]

    @IsString()
    comment: string

    @IsArray()
    change: IDetailChange[]
}