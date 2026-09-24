import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ReferralType,
  ReferralCommission,
  CommissionWithdrawalRequest,
  StandingOrder,
} from '@oriental/types';

@Injectable()
export class ReferralService {
  // In-memory commission mutations
  private commissions: ReferralCommission[] = [
    {
      id: 'comm-biz-001',
      referralType: ReferralType.BUSINESS,
      referrerId: 'mem-001',
      refereeId: 'mem-003',
      sourceTransactionId: 'TX-B2B-8812',
      transactionAmount: 45000000,
      commissionRatePct: 0.5,
      commissionAmount: 225000, // 0.5% * 45jt
      isPaidOut: false,
      createdAt: new Date('2026-09-18T10:00:00Z'),
    },
    {
      id: 'comm-inf-001',
      referralType: ReferralType.INFLUENCER,
      referrerId: 'mem-001',
      refereeId: 'cust-anon-09',
      sourceTransactionId: 'TX-RET-7741',
      transactionAmount: 3500000,
      commissionRatePct: 1.0,
      commissionAmount: 35000, // 1.0% * 3.5jt
      isPaidOut: false,
      createdAt: new Date('2026-09-20T14:30:00Z'),
    },
  ];

  // In-memory withdrawal requests
  private withdrawals: CommissionWithdrawalRequest[] = [
    {
      id: 'wdr-001',
      requestNumber: 'WDR-202609-0001',
      memberId: 'mem-001',
      memberName: 'Budi Santoso (Warung Berkah)',
      amount: 100000,
      bankName: 'BCA (Bank Central Asia)',
      accountNumber: '8910-234-551',
      accountHolderName: 'Budi Santoso',
      status: 'TRANSFERRED',
      requestedAt: new Date('2026-09-15T09:00:00Z'),
      processedAt: new Date('2026-09-15T11:00:00Z'),
    },
  ];

  // In-memory standing orders (Weekly delivery / pengadaan terjadwal)
  private standingOrders: StandingOrder[] = [
    {
      id: 'so-001',
      orderNumber: 'SO-202609-001',
      customerMemberId: 'mem-003',
      customerName: 'Kopi Kenangan Senja Cafe',
      customerSegment: 'B2B_CAFE',
      deliveryFrequency: 'RABU_SABTU',
      frequencyLabel: 'Setiap Hari Rabu & Sabtu',
      deliveryTimeSlot: 'Pagi (06:00 - 09:00 WITA) - Sebelum Buka Kafe',
      deliveryAddress: 'Jl. Boulevard Panakkukang No. 88, Makassar',
      items: [
        {
          productId: 'prod-minyak',
          productName: 'Minyak Goreng Oriental 2L (Karton @ 6 Pouch)',
          unit: 'KARTON',
          quantity: 2,
          unitPrice: 192000,
          subtotal: 384000,
        },
        {
          productId: 'prod-kopi',
          productName: 'Kopi Susu Gula Aren 250ml (Karton @ 12 Botol)',
          unit: 'KARTON',
          quantity: 3,
          unitPrice: 130000,
          subtotal: 390000,
        },
      ],
      totalAmountPerDelivery: 774000,
      nextDeliveryDate: '2026-09-26',
      status: 'ACTIVE',
      createdAt: new Date('2026-09-10T08:00:00Z'),
    },
  ];

  // Evaluates Business Referral qualification (Owner min 60M, Friend min 30M -> 0.5%)
  evaluateBusinessReferral(referrerSpendMonth: number, refereeSpendMonth: number): {
    qualified: boolean;
    ratePct: number;
    reason: string;
    referrerSpendMonth: number;
    refereeSpendMonth: number;
    commissionEarnedEstimate?: number;
  } {
    const REFERRER_MIN_SPEND = 60000000; // Rp 60 Juta
    const REFEREE_MIN_SPEND = 30000000;  // Rp 30 Juta

    if (referrerSpendMonth < REFERRER_MIN_SPEND) {
      return {
        qualified: false,
        ratePct: 0,
        referrerSpendMonth,
        refereeSpendMonth,
        reason: `Pengusul belum mencapai batas belanja Rp 60 Juta/bln (Saat ini: Rp ${referrerSpendMonth.toLocaleString('id-ID')})`,
      };
    }

    if (refereeSpendMonth < REFEREE_MIN_SPEND) {
      return {
        qualified: false,
        ratePct: 0,
        referrerSpendMonth,
        refereeSpendMonth,
        reason: `Rekan usaha belum mencapai batas belanja Rp 30 Juta/bln (Saat ini: Rp ${refereeSpendMonth.toLocaleString('id-ID')})`,
      };
    }

    const commissionEstimate = (refereeSpendMonth * 0.5) / 100;
    return {
      qualified: true,
      ratePct: 0.5,
      referrerSpendMonth,
      refereeSpendMonth,
      commissionEarnedEstimate: commissionEstimate,
      reason: 'Memenuhi syarat komisi referral bisnis 0.5%',
    };
  }

  // Calculate Influencer Commission (1.0% of product sales)
  calculateInfluencerCommission(productSaleAmount: number, influencerId: string = 'mem-001'): ReferralCommission {
    const ratePct = 1.0;
    const commissionAmount = Math.round((productSaleAmount * ratePct) / 100);

    const commission: ReferralCommission = {
      id: `comm-inf-${Date.now().toString().slice(-6)}`,
      referralType: ReferralType.INFLUENCER,
      referrerId: influencerId,
      sourceTransactionId: `tx-${Date.now().toString().slice(-6)}`,
      transactionAmount: productSaleAmount,
      commissionRatePct: ratePct,
      commissionAmount,
      isPaidOut: false,
      createdAt: new Date(),
    };

    this.commissions.unshift(commission);
    return commission;
  }

  // Record a new Business referral commission
  recordBusinessCommission(
    referrerId: string,
    refereeId: string,
    transactionAmount: number,
  ): ReferralCommission {
    const ratePct = 0.5;
    const commissionAmount = Math.round((transactionAmount * ratePct) / 100);

    const commission: ReferralCommission = {
      id: `comm-biz-${Date.now().toString().slice(-6)}`,
      referralType: ReferralType.BUSINESS,
      referrerId,
      refereeId,
      sourceTransactionId: `tx-${Date.now().toString().slice(-6)}`,
      transactionAmount,
      commissionRatePct: ratePct,
      commissionAmount,
      isPaidOut: false,
      createdAt: new Date(),
    };

    this.commissions.unshift(commission);
    return commission;
  }

  // Get Wallet Balance & Summary for a member
  getWalletBalance(memberId: string) {
    const memberCommissions = this.commissions.filter(
      (c) => c.referrerId === memberId || memberId === 'ALL',
    );
    const memberWithdrawals = this.withdrawals.filter(
      (w) => w.memberId === memberId || memberId === 'ALL',
    );

    const totalEarned = memberCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const totalWithdrawn = memberWithdrawals
      .filter((w) => w.status === 'TRANSFERRED' || w.status === 'APPROVED' || w.status === 'PENDING')
      .reduce((sum, w) => sum + w.amount, 0);

    const availableBalance = Math.max(0, totalEarned - totalWithdrawn);

    return {
      memberId,
      totalEarned,
      totalWithdrawn,
      availableBalance,
      commissionsCount: memberCommissions.length,
      withdrawalsCount: memberWithdrawals.length,
    };
  }

  getCommissions(memberId?: string): ReferralCommission[] {
    if (!memberId || memberId === 'ALL') return this.commissions;
    return this.commissions.filter((c) => c.referrerId === memberId);
  }

  getWithdrawals(memberId?: string): CommissionWithdrawalRequest[] {
    if (!memberId || memberId === 'ALL') return this.withdrawals;
    return this.withdrawals.filter((w) => w.memberId === memberId);
  }

  // Submit a withdrawal request from commission wallet
  requestWithdrawal(dto: {
    memberId: string;
    memberName: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  }): CommissionWithdrawalRequest {
    const wallet = this.getWalletBalance(dto.memberId);
    if (dto.amount <= 0) {
      throw new BadRequestException('Nominal penarikan harus lebih dari 0.');
    }
    if (dto.amount > wallet.availableBalance) {
      throw new BadRequestException(
        `Saldo komisi tidak mencukupi. Tersedia: Rp ${wallet.availableBalance.toLocaleString('id-ID')}`,
      );
    }

    const requestNumber = `WDR-202609-${(this.withdrawals.length + 1).toString().padStart(4, '0')}`;
    const request: CommissionWithdrawalRequest = {
      id: `wdr-${Date.now().toString().slice(-6)}`,
      requestNumber,
      memberId: dto.memberId,
      memberName: dto.memberName,
      amount: dto.amount,
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      accountHolderName: dto.accountHolderName,
      status: 'APPROVED',
      requestedAt: new Date(),
      processedAt: new Date(),
    };

    this.withdrawals.unshift(request);
    return request;
  }

  // Standing Orders Management (Weekly delivery / pengadaan terjadwal)
  getStandingOrders(customerMemberId?: string): StandingOrder[] {
    if (!customerMemberId || customerMemberId === 'ALL') return this.standingOrders;
    return this.standingOrders.filter((so) => so.customerMemberId === customerMemberId);
  }

  createStandingOrder(
    dto: Omit<StandingOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>,
  ): StandingOrder {
    const orderNumber = `SO-202609-${(this.standingOrders.length + 1).toString().padStart(3, '0')}`;
    const newOrder: StandingOrder = {
      id: `so-${Date.now().toString().slice(-6)}`,
      orderNumber,
      ...dto,
      status: 'ACTIVE',
      createdAt: new Date(),
    };

    this.standingOrders.unshift(newOrder);
    return newOrder;
  }

  updateStandingOrderStatus(id: string, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'): StandingOrder {
    const order = this.standingOrders.find((so) => so.id === id);
    if (!order) {
      throw new BadRequestException('Standing order tidak ditemukan.');
    }
    order.status = status;
    return order;
  }
}
