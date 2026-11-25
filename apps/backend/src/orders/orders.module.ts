import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { KdsModule } from '../kds/kds.module';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [KdsModule, AccountingModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}