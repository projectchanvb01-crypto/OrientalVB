import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { MembersModule } from './modules/members/members.module';
import { PosModule } from './modules/pos/pos.module';
import { WasteModule } from './modules/waste/waste.module';
import { ReferralModule } from './modules/referral/referral.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { WhiteLabelModule } from './modules/whitelabel/whitelabel.module';
import { WmsModule } from './modules/wms/wms.module';

import { AppController } from './app.controller';

@Module({
  imports: [
    AuthModule,
    MembersModule,
    PosModule,
    WasteModule,
    ReferralModule,
    AccountingModule,
    WhiteLabelModule,
    WmsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

