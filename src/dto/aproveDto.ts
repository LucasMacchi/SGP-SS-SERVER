import { IsNotEmpty, IsArray, IsString } from "class-validator";
import { IDetailChange } from "src/utils/interfaces";

export default class aproveDto {
  @IsString()
  comment: string
}