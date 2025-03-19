import { Controller, Get, Post, Patch, Req, Body } from '@nestjs/common';
import registerUser from 'src/dto/userDto';
@Controller('user')
export class UserController {
    @Get('all')
    getAllUsers () {

    }
    @Post('login')
    loginUser () {

    }
    @Post('register')
    registerUser (@Body() body: registerUser) {
        return body
    }
    @Patch('activar')
    activarUser () {

    }
    @Patch('desactivar')
    desactivarUser () {
        
    }

}
