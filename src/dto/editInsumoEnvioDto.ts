import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export default class {
    @IsNumber()
    @IsNotEmpty()
    ins_id: number

    @IsString()
    @IsNotEmpty()
    stat: string

    @IsNumber()
    @IsNotEmpty()
    newVal: number
}