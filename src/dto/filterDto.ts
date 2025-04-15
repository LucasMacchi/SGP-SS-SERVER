import { IsNumber, IsString } from "class-validator";

export default class filterDto {

    @IsNumber()
    limit: number

    @IsNumber()
    client: number

    @IsNumber()
    service: number

    @IsString()
    requester: string

    @IsString()
    numero: string

    @IsString()
    state: string

    @IsString()
    dateStart: string

    @IsString()
    dateEnd: string
}