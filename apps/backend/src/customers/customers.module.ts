import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';

@Module({
  controllers: [CustomersController, LoyaltyController],
  providers: [CustomersService, LoyaltyService],
  exports: [CustomersService, LoyaltyService],
})
export class CustomersModule {}