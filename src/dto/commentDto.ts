import { IsString } from "class-validator";

export default class commentDto {
    @IsString()
    comment: string
}