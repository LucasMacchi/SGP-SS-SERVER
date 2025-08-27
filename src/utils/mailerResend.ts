import { Resend } from "resend";
import dotenv from 'dotenv'; 
dotenv.config();
const API_KEY_RESEND = process.env.API_KEY_RESEND ?? ''

const mail_user = process.env.EMAIL_USERNAME 
export default async function (to: string | string[], subject: string, msg: string) {
    try {
        const resend = new Resend(API_KEY_RESEND)
        const {data, error} = await resend.emails.send({
            from: `Sistema Gestion de Pedidos <${mail_user}>`,
            to,
            subject,
            text: msg
        })
        if(error) {
            console.log(error)
            throw new Error("Error al enviar correo: "+error.message)
        }
        return 0
    } catch (error) {
        console.log(error)
        return 0
    }
}