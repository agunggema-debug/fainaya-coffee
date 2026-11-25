import { Module } from '@nestjs/common';
import { KdsGateway } from './kds.gateway';
import { KdsService } from './kds.service';
import { KdsController } from './kds.controller';

@Module({
  providers: [KdsGateway, KdsService],
  controllers: [KdsController],
  exports: [KdsGateway, KdsService],
})
export class KdsModule {}