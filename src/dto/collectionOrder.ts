import { IsArray, IsNotEmpty } from "class-validator";

export default class collectionOrderDto {
    @IsArray()
    @IsNotEmpty()
    orders: string[]
    
}