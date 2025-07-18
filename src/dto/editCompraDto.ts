import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class editCompraDes {
    @IsNumber()
    @IsNotEmpty()
    detailID: number

    @IsString()
    @IsNotEmpty()
    descripcion: string
}

export class editCompraCant {
    @IsNumber()
    @IsNotEmpty()
    detailID: number

    @IsNumber()
    @IsNotEmpty()
    cantidad: number
}

export class commentCompra {
    @IsString()
    @IsNotEmpty()
    comentario: string
}