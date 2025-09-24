import { IsNotEmpty, IsNumber } from "class-validator"

export default class {
    @IsNumber()
    @IsNotEmpty()
    detail_id: number

    @IsNumber()
    @IsNotEmpty()
    newVal: number
}