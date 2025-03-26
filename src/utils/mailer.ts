import { ISendMailOptions } from '@nestjs-modules/mailer';
import dotenv from 'dotenv'; 
dotenv.config();

const mail_user = process.env.EMAIL_USERNAME 


export default function (from: string, to: string | string[], subject: string, msg: string): ISendMailOptions {
    const mail: ISendMailOptions = {
        from: `${from} <${mail_user}>`,
        to: to,
        subject: subject,
        text: msg
    }

    return mail
}