import { IsNotEmpty, IsString } from "class-validator";

export default class {
    @IsString()
    @IsNotEmpty()
    titulo: string

    @IsString()
    @IsNotEmpty()
    des: string

    @IsString()
    @IsNotEmpty()
    remito: string
}
