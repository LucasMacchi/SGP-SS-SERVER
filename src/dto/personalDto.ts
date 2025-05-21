import { IsNotEmpty, IsNumber, IsString, IsArray, IsBoolean } from "class-validator";

export default class personalDto {
  @IsNumber()
  @IsNotEmpty()
  legajo: number
  
  @IsNumber()
  @IsNotEmpty()
  cuil: number
  
  @IsString()
  @IsNotEmpty()
  fullname: string
  
  @IsString()
  @IsNotEmpty()
  sector: string
}