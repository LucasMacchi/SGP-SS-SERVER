import { Module } from '@nestjs/common';
import { UserController } from './user/user.controller';
import { UserService } from './user';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.TOKEN_SECRET ?? undefined
const expireTime = process.env.TOKEN_EXPIRE ?? '60s'
@Module({
  imports: [    
    JwtModule.register({
    global: true,
    signOptions: {expiresIn: expireTime},
    secret: secret
    
  })],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
