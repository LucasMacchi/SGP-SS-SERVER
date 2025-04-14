import { IsNotEmpty, IsNumber } from "class-validator";


export default class changeProvDto {

    @IsNumber()
    @IsNotEmpty()
    client_id: number

    @IsNumber()
    @IsNotEmpty()
    service_id: number

}