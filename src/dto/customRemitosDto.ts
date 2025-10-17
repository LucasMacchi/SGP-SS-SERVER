import { IsArray, IsNotEmpty } from "class-validator"


export default class {
    @IsArray()
    @IsNotEmpty()
    remitos: string[]
}