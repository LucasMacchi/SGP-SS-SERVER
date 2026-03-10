import { Module } from '@nestjs/common';
import { FumigacionController } from './fumigacion.controller';
import { FumigacionService } from './fumigacion.service';

@Module({
  controllers: [FumigacionController],
  providers: [FumigacionService]
})
export class FumigacionModule {}
