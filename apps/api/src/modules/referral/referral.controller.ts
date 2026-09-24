import { Controller, Post, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReferralService } from './referral.service';

@ApiTags('Referral & Affiliate Engine')
@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post('check-business-qualification')
  @ApiOperation({ summary: 'Validasi kelayakan komisi referral bisnis (Syarat 60jt & 30jt)' })
  checkBusiness(@Body() body: { referrerSpend: number; refereeSpend: number }) {
    return this.referralService.evaluateBusinessReferral(body.referrerSpend, body.refereeSpend);
  }

  @Post('calculate-influencer')
  @ApiOperation({ summary: 'Kalkulasi komisi afiliasi influencer 1.0%' })
  calculateInfluencer(@Body() body: { saleAmount: number; influencerId?: string }) {
    return this.referralService.calculateInfluencerCommission(body.saleAmount, body.influencerId);
  }

  @Post('record-business')
  @ApiOperation({ summary: 'Pencatatan komisi referral bisnis 0.5%' })
  recordBusiness(
    @Body() body: { referrerId: string; refereeId: string; transactionAmount: number },
  ) {
    return this.referralService.recordBusinessCommission(
      body.referrerId,
      body.refereeId,
      body.transactionAmount,
    );
  }

  @Get('wallet/:memberId')
  @ApiOperation({ summary: 'Informasi saldo dompet komisi referral & total penarikan' })
  getWallet(@Param('memberId') memberId: string) {
    return this.referralService.getWalletBalance(memberId);
  }

  @Get('commissions')
  @ApiOperation({ summary: 'Riwayat komisi referral bisnis & influencer' })
  getCommissions(@Query('memberId') memberId?: string) {
    return this.referralService.getCommissions(memberId);
  }

  @Get('withdrawals')
  @ApiOperation({ summary: 'Riwayat pengajuan penarikan dana komisi (withdraw)' })
  getWithdrawals(@Query('memberId') memberId?: string) {
    return this.referralService.getWithdrawals(memberId);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Pengajuan penarikan saldo komisi referral ke rekening bank / e-wallet' })
  requestWithdraw(
    @Body()
    body: {
      memberId: string;
      memberName: string;
      amount: number;
      bankName: string;
      accountNumber: string;
      accountHolderName: string;
    },
  ) {
    return this.referralService.requestWithdrawal(body);
  }

  @Get('standing-orders')
  @ApiOperation({ summary: 'Daftar pemesanan pasokan bahan baku terjadwal (Standing Order)' })
  getStandingOrders(@Query('customerMemberId') customerMemberId?: string) {
    return this.referralService.getStandingOrders(customerMemberId);
  }

  @Post('standing-orders')
  @ApiOperation({ summary: 'Buat jadwal pemesanan pasokan terjadwal baru (Weekly Delivery)' })
  createStandingOrder(@Body() body: any) {
    return this.referralService.createStandingOrder(body);
  }

  @Patch('standing-orders/:id/status')
  @ApiOperation({ summary: 'Update status standing order (ACTIVE, PAUSED, CANCELLED)' })
  updateStandingOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' },
  ) {
    return this.referralService.updateStandingOrderStatus(id, body.status);
  }
}
