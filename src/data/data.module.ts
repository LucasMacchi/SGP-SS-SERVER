import { Module } from '@nestjs/common';
import { DataController } from './data/data.controller';
import { DataProvider } from './data';

@Module({
  controllers: [DataController],
  providers: [DataProvider]
})
export class DataModule {}
