import { Module } from '@nestjs/common';
import { WhiteLabelService } from './whitelabel.service';
import { WhiteLabelController } from './whitelabel.controller';

@Module({
  controllers: [WhiteLabelController],
  providers: [WhiteLabelService],
  exports: [WhiteLabelService],
})
export class WhiteLabelModule {}
