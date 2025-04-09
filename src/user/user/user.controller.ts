import { Controller, Get, Post, Patch, Param, Body, UnauthorizedException, Req, UseGuards } from '@nestjs/common';
import registerUser from 'src/dto/userDto';
import loginDto from 'src/dto/loginDto';
import { UserService } from '../user';
import { JwtService } from '@nestjs/jwt';
import { userGuard } from '../userAuth.guard';
import emailerDto from 'src/dto/emailerDto';


@Controller('user')
export class UserController {
    constructor(
        private userService: UserService, 
        private JwtService: JwtService
    ) {}
    @UseGuards(userGuard)
    @Get('all')
    async getAllUsers (@Req() rq: Request) {
        if(rq['user']['rol'] === 1) {
            return await this.userService.getAll()
        }
        else throw new UnauthorizedException()
    }
    @Post('login')
    async loginUser (@Body() body: loginDto) {
        const user = await this.userService.login(body.username)
        console.log("Username: ",user)
        if(user[0] && user[0]['activated']) {
            const payload = {user: body.username, rol: user[0]['rol'], first_name: user[0]['first_name'], 
                last_name: user[0]['last_name'], usuario_id: user[0]['usuario_id'], email: user[0]['email']}
            const token = this.JwtService.sign(payload)
            return token
            
        }
        else throw new UnauthorizedException()
    }
    @UseGuards(userGuard)
    @Post('register')
    async registerUser (@Body() body: registerUser, @Req() rq: Request) {
        if(rq['user']['rol'] === 1){
            await this.userService.createUser(body.username, body.first_name, body.last_name, body.rol, body.email)
            return 'Usuario ' + body.username + ' creado'
        }
        throw new UnauthorizedException()

    }
    @UseGuards(userGuard)
    @Patch('activar/:user')
    async activarUser (@Param('user') user: string, @Req() rq: Request) {
        if(rq['user']['rol'] === 1) {
            await this.userService.activateUser(user)
            return 'Usuario ' + user + ' activado'
        }
        throw new UnauthorizedException()
    }
    @UseGuards(userGuard)
    @Patch('desactivar/:user')
    async desactivarUser (@Param('user') user: string, @Req() rq: Request) {
        if(rq['user']['rol'] === 1) {
            await this.userService.deactivateUser(user)
            return 'Usuario ' + user + ' desactivado'
        }
        throw new UnauthorizedException()
    }
    @UseGuards(userGuard)
    @Post('email')
    async emailerUser (@Body() body: emailerDto, @Req() rq: Request) {
        if(rq['user']['rol'] === 1) {
            await this.userService.emailer(body.to_send, body.msg, body.sender)
            console.log('Correo enviado a ',body.to_send)
            return 'Correo creado'
        }
        throw new UnauthorizedException()
    }

}
