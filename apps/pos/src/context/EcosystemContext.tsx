import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, membersApi, posApi, wasteApi, whiteLabelApi, referralApi, accountingApi } from '../lib/api';
import { localDb, type SyncLogEntry, type OfflineTransaction } from '../lib/db';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import {
  CustomerSegment,
  DelegateUserDto,
  LOYALTY_POINT_RULES,
  MemberOneIdentity,
  PointMutationRecord,
  ProductUnitVariant,
  ProductWithMultiUnit,
  RegionCode,
  RegisterMemberDto,
  UserProfile,
  UserRole,
  WasteCategoryRate,
  WasteLocationPartner,
  WastePurchaseRecord,
  WhiteLabelVendor,
  WhiteLabelContract,
  WhiteLabelBatchReceipt,
  WhiteLabelProductItem,
  WhiteLabelB2BOrder,
  EcosystemPillar,
  StandingOrderItem,
  StandingOrder,
  ReferralType,
  ReferralCommission,
  CommissionWithdrawalRequest,
  CourseModule,
  QuizQuestion,
  QuizSubmissionDto,
  QuizResult,
  DigitalCertificate,
  OfflineWorkshop,
  WorkshopRegistrationDto,
  IncomeStatementSAK,
  BalanceSheetSAK,
  CashFlowStatementSAK,
  CustomerTier,
  OrientalPayTransactionRecord,
  WastePartnerSettlementClaim,
  InfluencerProductLink,
  PaymentMethod,
  OutletBusinessLineMatrix,
  OutletLocation,
  InterStoreTransferRecord,
  InterStoreTransferItem,
  TransferStatus,
  PriceProposalStatus,
  ProofAttachment,
  BranchPriceProposal,
  PricingSegmentType,
  ProductSegmentPrice,
  DailySalesReportData,
  CashierShiftReportData,
  PaymentMethodBreakdownData,
  OutletSummaryReportData,
  FastMovingProductData,
  PeriodRevenueData,
  VoidAuditRecord,
} from '@oriental/types';

export interface PointHistoryItem {
  id: string;
  date: string;
  invoiceNumber: string;
  channel: 'RETAIL' | 'GROSIR' | 'WASTE' | 'UKM_SUPPLY' | 'WHITE_LABEL';
  description: string;
  transactionAmount: number;
  pointsEarned: number;
  couponsEarned: number;
}

export interface MemberState {
  code: string;
  name: string;
  phone: string;
  segment: string;
  totalPoints: number;
  monthlySpend: number;
  doorprizeCoupons: Array<{ code: string; date: string; source: string }>;
  history: PointHistoryItem[];
}

export interface PillarFinancials {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  cashAndBank: number;
  accountsReceivable: number;
  inventory: number;
  liabilities: number;
}

export interface FinancialLedgerState {
  retailRevenue: number;
  grosirRevenue: number;
  ukmSupplyRevenue: number;
  whiteLabelRevenue: number;
  wastePurchasesTotal: number;
  wasteFactoryValueTotal: number;
  wasteShareExpense: number; // 10% bagi hasil mitra
  cogsCost: number;
  cashAndBank: number;
  accountsReceivable: number; // Piutang Grosir TOP
  inventoryValue: number;
  wasteInventoryValue: number;
  wastePayable: number; // Utang bagi hasil mitra tempat
  totalTransactionsCount: number;
  pillars: {
    RETAIL: PillarFinancials;
    GROSIR: PillarFinancials;
    UKM_SUPPLY: PillarFinancials;
    WASTE: PillarFinancials;
    WHITE_LABEL: PillarFinancials;
  };
}

export interface RetailCartItem {
  productId: string;
  productName: string;
  unitVariant: ProductUnitVariant;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface EcosystemContextType {
  // Members & One Identity
  membersList: MemberOneIdentity[];
  activeMember: MemberOneIdentity;
  selectActiveMember: (codeOrId: string) => void;
  registerNewMember: (dto: RegisterMemberDto) => MemberOneIdentity;
  member: MemberState; // Compatibility with existing views

  // RBAC & Users
  systemUsers: UserProfile[];
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  delegateNewUser: (dto: DelegateUserDto) => UserProfile;
  toggleUserStatus: (userId: string) => void;

  // Inventory & POS Cart
  financials: FinancialLedgerState;
  products: ProductWithMultiUnit[];
  retailCart: RetailCartItem[];
  addToRetailCart: (product: ProductWithMultiUnit, variant: ProductUnitVariant) => void;
  updateRetailCartQty: (productId: string, unitName: string, delta: number) => void;
  clearRetailCart: () => void;
  formatStock: (product: ProductWithMultiUnit) => string;
  addRetailTransaction: (paidAmount: number, paymentMethod: string, discountTotal?: number) => {
    invoiceNumber: string;
    pointsEarned: number;
    couponsEarned: number;
    couponCodes: string[];
    items: RetailCartItem[];
    grandTotal: number;
    paidAmount: number;
    changeAmount: number;
  };
  addB2BTransaction: (
    items: any[],
    grandTotal: number,
    paymentType: 'CASH' | 'TERMIN',
    customerName: string,
    channel?: 'GROSIR' | 'UKM_SUPPLY',
    topOptions?: { topDays?: number; dueDate?: string },
  ) => {
    invoiceNumber: string;
    pointsEarned: number;
    couponsEarned: number;
    couponCodes: string[];
    channel: 'GROSIR' | 'UKM_SUPPLY';
    topDays?: number;
    dueDate?: string;
  };
  addGrosirTransaction: (
    items: any[],
    grandTotal: number,
    paymentType: 'CASH' | 'TERMIN',
    customerName: string,
    channel?: 'GROSIR' | 'UKM_SUPPLY',
  ) => {
    invoiceNumber: string;
    pointsEarned: number;
    couponsEarned: number;
    couponCodes: string[];
    channel: 'GROSIR' | 'UKM_SUPPLY';
  };

  // Waste Purchasing (Circular Economy POS)
  wasteCategories: WasteCategoryRate[];
  wastePartners: WasteLocationPartner[];
  wasteHistory: WastePurchaseRecord[];
  recordWastePurchase: (data: {
    sellerMemberId: string;
    sellerName: string;
    operatorId: string;
    locationPartnerId: string;
    wasteCategory: string;
    grossWeightKg: number;
    tareWeightKg?: number;
    netWeightKg: number;
    pricePerKg: number;
    factorySellingPricePerKg: number;
    partnerProfitSharePct?: number; // flat 5% purchase price share (v2.1)
    qualityGrade?: 'SUPER' | 'STANDAR' | 'KERUH';
    notes?: string;
    payoutMethod?: 'CASH' | 'ORIENTAL_PAY';
  }) => WastePurchaseRecord;

  // White Label Production & B2B UKM Supply
  whiteLabelVendors: WhiteLabelVendor[];
  whiteLabelContracts: WhiteLabelContract[];
  whiteLabelCatalog: WhiteLabelProductItem[];
  whiteLabelReceipts: WhiteLabelBatchReceipt[];
  whiteLabelOrders: WhiteLabelB2BOrder[];
  registerWhiteLabelVendor: (dto: Omit<WhiteLabelVendor, 'id' | 'code' | 'isActive'>) => WhiteLabelVendor;
  createWhiteLabelContract: (dto: Omit<WhiteLabelContract, 'id' | 'contractNumber' | 'status'>) => WhiteLabelContract;
  receiveWhiteLabelBatch: (data: {
    contractId: string;
    batchNumber: string;
    receivedQuantity: number;
    qcPassed: boolean;
    qcNotes?: string;
  }) => WhiteLabelBatchReceipt;
  orderWhiteLabelProduct: (data: {
    customerMemberId: string;
    customerName: string;
    customerSegment: string;
    productId: string;
    quantity: number;
  }) => WhiteLabelB2BOrder;

  // Sprint 5: B2B UKM Supply, Standing Orders & Referral Engine
  standingOrders: StandingOrder[];
  commissions: ReferralCommission[];
  withdrawals: CommissionWithdrawalRequest[];
  createStandingOrder: (dto: Omit<StandingOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>) => StandingOrder;
  toggleStandingOrderStatus: (id: string, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED') => void;
  dispatchStandingOrder: (id: string) => { invoiceNumber: string; totalAmount: number; pointsEarned: number };
  evaluateBusinessReferral: (referrerSpend: number, refereeSpend: number) => {
    qualified: boolean;
    ratePct: number;
    reason: string;
    referrerSpendMonth: number;
    refereeSpendMonth: number;
    commissionEarnedEstimate?: number;
  };
  recordBusinessReferralCommission: (referrerId: string, refereeId: string, transactionAmount: number) => ReferralCommission;
  recordInfluencerReferralCommission: (productSaleAmount: number, influencerId: string) => ReferralCommission;
  requestCommissionWithdrawal: (dto: {
    memberId: string;
    memberName: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  }) => CommissionWithdrawalRequest;
  getCommissionWallet: (memberId: string) => {
    totalEarned: number;
    totalWithdrawn: number;
    availableBalance: number;
    commissionsCount: number;
    withdrawalsCount: number;
  };

  // Sprint 6: SAK Reporting & Oriental Learn
  courses: CourseModule[];
  workshops: OfflineWorkshop[];
  certificates: DigitalCertificate[];
  submitQuizAttempt: (dto: QuizSubmissionDto) => QuizResult;
  registerWorkshopAttendee: (dto: WorkshopRegistrationDto) => any;
  exportFinancialStatementDoc: (format: 'PDF' | 'EXCEL', statementType: 'LABA_RUGI' | 'NERACA' | 'ARUS_KAS') => any;

  // Sprint 7: Loyalty Tiers, Closed-Loop Oriental Pay & Waste Claims
  payWithOrientalPay: (
    memberId: string,
    amount: number,
    description: string,
    invoiceNumber?: string,
    channel?: string,
  ) => boolean;
  topUpOrientalPay: (
    memberId: string,
    amount: number,
    source: 'REFERRAL_COMMISSION' | 'WASTE_PAYOUT' | 'MANUAL_DEPOSIT',
    referenceId?: string,
  ) => void;
  evaluateMemberTier: (rolling3MonthAvg: number) => {
    tier: CustomerTier;
    nextTierThreshold: number;
    discountPct: number;
    pointBonusPct: number;
    warning: boolean;
  };
  wasteSettlementClaims: WastePartnerSettlementClaim[];
  generateWasteSettlementClaim: (partnerId: string, periodMonth: string) => WastePartnerSettlementClaim;
  influencerLinks: InfluencerProductLink[];
  generateInfluencerLink: (memberId: string, productId: string) => InfluencerProductLink;

  // Sprint 7: PWA Offline-First & Dexie Sync Engine
  isOfflineSimulated: boolean;
  setIsOfflineSimulated: React.Dispatch<React.SetStateAction<boolean>>;
  isNetworkOnline: boolean;
  isEffectiveOnline: boolean;
  pendingOfflineCount: number;
  pendingOfflineTransactions: OfflineTransaction[];
  triggerSyncOfflineBatch: () => Promise<{ success: boolean; syncedCount: number; duplicatesSkipped: number; message: string }>;
  recentSyncLogs: SyncLogEntry[];
  refreshPendingSync: () => Promise<void>;

  // Sprint 8: Multi-Outlet, Stock Transfers & Branch Price Proposals
  outletsList: OutletLocation[];
  activeOutletId: string;
  activeOutlet: OutletLocation;
  setActiveOutletId: (outletId: string) => void;
  toggleOutletBusinessLine: (outletId: string, lineKey: keyof OutletBusinessLineMatrix) => void;
  stockTransfers: InterStoreTransferRecord[];
  createStockTransfer: (dto: {
    sourceOutletId: string;
    targetOutletId: string;
    items: {
      productId: string;
      variantUnitName: string;
      quantity: number;
    }[];
    notes?: string;
    driverName?: string;
    vehiclePlate?: string;
  }) => InterStoreTransferRecord;
  dispatchStockTransfer: (transferId: string, driverName?: string, vehiclePlate?: string) => void;
  receiveStockTransfer: (transferId: string, receivedBy?: string) => void;
  cancelStockTransfer: (transferId: string) => void;
  branchPriceProposals: BranchPriceProposal[];
  submitBranchPriceProposal: (dto: {
    outletId: string;
    productId: string;
    proposedPrice: number;
    proposalType: 'PRICE_DROP' | 'LOCAL_PROMO';
    reason: string;
    competitorName: string;
    competitorPrice: number;
    proofAttachments: { name: string; url: string }[];
  }) => BranchPriceProposal;
  reviewBranchPriceProposal: (proposalId: string, approved: boolean, notes: string) => void;
  finalizeBranchPriceProposal: (proposalId: string, approved: boolean, notes: string) => void;

  // Sprint 9: 7 Operational Reports, TOP Credit Plafon & Flexible Price List Engine
  dailySalesReport: DailySalesReportData;
  cashierShiftReports: CashierShiftReportData[];
  paymentMethodBreakdown: PaymentMethodBreakdownData[];
  outletSummaries: OutletSummaryReportData[];
  fastMovingProducts: FastMovingProductData[];
  periodRevenueReports: PeriodRevenueData[];
  voidAuditRecords: VoidAuditRecord[];
  productSegmentPrices: ProductSegmentPrice[];
  addProductSegmentPrice: (dto: Omit<ProductSegmentPrice, 'id'>) => ProductSegmentPrice;
  updateProductSegmentPrice: (id: string, updates: Partial<ProductSegmentPrice>) => void;
  deleteProductSegmentPrice: (id: string) => void;
  recordVoidTransaction: (dto: {
    invoiceNumber: string;
    originalAmount: number;
    voidReason: string;
    cashierName: string;
    approvedByManager: string;
    restockedItems: { name: string; qty: number; unit: string }[];
    notes?: string;
  }) => VoidAuditRecord;
  reconcileCashierShift: (shiftId: string, actualCashCounted: number, notes?: string) => void;
  checkMemberTopCreditStatus: (memberCode: string, newOrderAmount: number) => {
    allowed: boolean;
    reason?: string;
    creditLimit: number;
    currentReceivables: number;
    projectedReceivables: number;
    hasOverdue: boolean;
    overdueInvoices: string[];
    topAllowedDays: number;
  };
  settleMemberReceivable: (memberCode: string, amount: number) => void;
}


// Initial Mock Members from Template Form Costumer One Identity
const INITIAL_MEMBERS: MemberOneIdentity[] = [
  {
    id: 'mem-001',
    memberCode: '102-260820-01',
    barcode: '82000080',
    fullName: 'Pak Catur',
    nik: '7308012304850001',
    phone: '081234567890',
    birthDate: '1985-04-23',
    gender: 'Pria',
    email: 'catur.maliku@gmail.com',
    address: 'Jl. Ahmad Yani No. 12, Watampone, Bone',
    regionCode: RegionCode.WATAMPONE,
    segment: CustomerSegment.B2B_RESTAURANT,
    businessName: 'RM Maliku Fried Chicken',
    businessProfiles: [
      {
        businessIndex: 1,
        businessCode: '102-260820-01-01-100',
        businessName: 'RM Maliku Fried Chicken',
        businessType: 'Warung / Resto',
        businessLocation: 'Watampone Kota',
        picName: 'Pak Catur',
        picRole: 'Owner',
        picWhatsapp: '081234567890',
        businessModel: 'Single Ownership',
        featuredProducts: ['Indonesian Food', 'Ayam Goreng Sambal'],
      },
      {
        businessIndex: 2,
        businessCode: '102-260820-01-02-100',
        businessName: 'Café Simpang Badik',
        businessType: 'Café',
        businessLocation: 'Simpang Badik, Bone',
        picName: 'Pak Catur',
        picRole: 'Owner',
        picWhatsapp: '081234567890',
        businessModel: 'Single Ownership',
        featuredProducts: ['Signature Coffee', 'Non-Coffee', 'Roti & Bakery'],
      },
      {
        businessIndex: 3,
        businessCode: '102-260820-01-01-900',
        businessName: 'Grosir Sembako Bone',
        businessType: 'Grosir',
        businessLocation: 'Jl. Merdeka, Bone',
        picName: 'Pak Catur',
        picRole: 'Owner',
        picWhatsapp: '081234567890',
        businessModel: 'Single Ownership',
      },
    ],
    surveyData: {
      outletCount: 3,
      monthlySpendEstimate: 'Rp. 80 Jt - 120 Jt',
      mainRawMaterials: ['Frozen Daging', 'Bahan Minuman', 'Bumbu Dapur', 'Kemasan Plastik'],
      posUsage: 'Pakai',
      managementStructure: 'Ada Divisi (Keuangan/Pajak/Operasional)',
      businessGoals: ['Buka Cabang', 'Perbaiki Management'],
    },
    // Sprint 7: Loyalty Tier (Rolling 3 Bulan > 70M = PLATINUM)
    currentTier: CustomerTier.PLATINUM,
    rolling3MonthAvgSpend: 85000000,
    monthlySpendsRecent: [80000000, 90000000, 85000000],
    tierEvaluatedAt: '2026-09-01',
    tierExpiresAt: '2026-09-30',
    downgradeWarning: false,
    // Closed-Loop Oriental Pay Wallet
    orientalPayBalance: 2450000,
    influencerAffiliateCode: 'CATUR88',
    orientalPayHistory: [
      {
        id: 'op-tx-001',
        memberId: 'mem-001',
        type: 'REFERRAL_COMMISSION',
        amount: 240000,
        balanceAfter: 240000,
        description: 'Komisi Referral Bisnis B2B (INV-GRO-882012)',
        referenceId: 'INV-GRO-882012',
        createdAt: '2026-09-19T16:00:00Z',
      },
      {
        id: 'op-tx-002',
        memberId: 'mem-001',
        type: 'WASTE_PAYOUT',
        amount: 360000,
        balanceAfter: 600000,
        description: 'Pencairan Hasil Setor Minyak Jelantah 45kg',
        referenceId: 'WST-2609-001',
        createdAt: '2026-09-20T10:00:00Z',
      },
      {
        id: 'op-tx-003',
        memberId: 'mem-001',
        type: 'TOPUP',
        amount: 2000000,
        balanceAfter: 2600000,
        description: 'Deposit Saldo Dompet Oriental Pay',
        createdAt: '2026-09-21T09:00:00Z',
      },
      {
        id: 'op-tx-004',
        memberId: 'mem-001',
        type: 'PURCHASE_PAYMENT',
        amount: -150000,
        balanceAfter: 2450000,
        description: 'Pembayaran Belanja Retail Swalayan (INV-RET-409182)',
        channel: 'RETAIL',
        referenceId: 'INV-RET-409182',
        createdAt: '2026-09-22T10:15:00Z',
      },
    ],
    totalLoyaltyPoints: 320,
    totalSpendMonth: 85000000,
    doorprizeCouponsCount: 25,
    doorprizeCoupons: [
      'ORT-KUP2609-0012',
      'ORT-KUP2609-0013',
      'ORT-KUP2609-0014',
      'ORT-KUP2609-0015',
    ],
    pointHistory: [
      {
        id: 'mut-101',
        memberId: 'mem-001',
        date: '2026-09-20, 14:30',
        invoiceNumber: 'INV-GRO-981204',
        channel: 'GROSIR',
        description: 'Belanja Partai Besar Sembako 10 Dus Minyak & 5 Sak Beras',
        transactionAmount: 18500000,
        pointsEarned: 92,
        couponsEarned: 12,
      },
      {
        id: 'mut-102',
        memberId: 'mem-001',
        date: '2026-09-22, 10:15',
        invoiceNumber: 'INV-RET-409182',
        channel: 'RETAIL',
        description: 'Belanja Harian Swalayan Kebutuhan Dapur',
        transactionAmount: 1250000,
        pointsEarned: 12,
        couponsEarned: 8,
      },
    ],
    // Sprint 9 Additions: Plafon & Overdue Lock
    creditLimit: 40000000,
    currentOutstandingReceivables: 18500000,
    hasOverdueInvoices: false,
    overdueInvoiceNumbers: [],
    topAllowedDays: 14,
    isActive: true,
    registeredAt: new Date('2026-08-20'),
  },
  {
    id: 'mem-002',
    memberCode: '101-260901-02',
    barcode: '82000081',
    fullName: 'Ibu Hj. Rahmawati',
    nik: '7371025508820002',
    phone: '085299887766',
    birthDate: '1982-08-15',
    gender: 'Wanita',
    email: 'hj.rahmawati@coto.co.id',
    address: 'Jl. Boulevard Panakkukang No. 88, Makassar',
    regionCode: RegionCode.MAKASSAR,
    segment: CustomerSegment.B2B_WARUNG,
    businessName: 'Coto Makassar Nusantara',
    businessProfiles: [
      {
        businessIndex: 1,
        businessCode: '101-260901-02-01-100',
        businessName: 'Coto Makassar Nusantara',
        businessType: 'Warung / Kuliner Khas',
        businessLocation: 'Panakkukang, Makassar',
        picName: 'Ibu Hj. Rahmawati',
        picRole: 'Owner',
        picWhatsapp: '085299887766',
        businessModel: 'Single Ownership',
        featuredProducts: ['Indonesian Food', 'Bumbu Rempah Coto'],
      },
    ],
    surveyData: {
      outletCount: 2,
      monthlySpendEstimate: 'Rp. 50 Jt - 80 Jt',
      mainRawMaterials: ['Daging Fresh', 'Bumbu Dapur', 'Kemasan Plastik'],
      posUsage: 'Pakai',
      managementStructure: 'Tidak ada, saya mengelola Sendiri',
      businessGoals: ['Buka Cabang'],
    },
    // Sprint 7: Loyalty Tier (Rolling 3 Bulan 42M = SILVER)
    currentTier: CustomerTier.SILVER,
    rolling3MonthAvgSpend: 42000000,
    monthlySpendsRecent: [40000000, 44000000, 42000000],
    tierEvaluatedAt: '2026-09-01',
    tierExpiresAt: '2026-09-30',
    downgradeWarning: false,
    orientalPayBalance: 500000,
    influencerAffiliateCode: 'HJRAHMA',
    orientalPayHistory: [
      {
        id: 'op-tx-101',
        memberId: 'mem-002',
        type: 'TOPUP',
        amount: 500000,
        balanceAfter: 500000,
        description: 'Deposit Awal Dompet Oriental Pay',
        createdAt: '2026-09-05T08:00:00Z',
      },
    ],
    totalLoyaltyPoints: 185,
    totalSpendMonth: 42000000,
    doorprizeCouponsCount: 14,
    doorprizeCoupons: ['ORT-KUP2609-0021', 'ORT-KUP2609-0022'],
    pointHistory: [
      {
        id: 'mut-201',
        memberId: 'mem-002',
        date: '2026-09-18, 09:40',
        invoiceNumber: 'INV-RET-310928',
        channel: 'RETAIL',
        description: 'Belanja Rutin Bumbu Dapur & Beras',
        transactionAmount: 2400000,
        pointsEarned: 24,
        couponsEarned: 16,
      },
    ],
    // Sprint 9 Additions: Plafon & Overdue Lock
    creditLimit: 25000000,
    currentOutstandingReceivables: 18500000,
    hasOverdueInvoices: false,
    overdueInvoiceNumbers: [],
    topAllowedDays: 14,
    isActive: true,
    registeredAt: new Date('2026-09-01'),
  },
  {
    id: 'mem-003',
    memberCode: '102-260915-05',
    barcode: '82000082',
    fullName: 'Haji Syamsuddin',
    nik: '7308051112700003',
    phone: '082199001122',
    birthDate: '1970-12-11',
    gender: 'Pria',
    email: 'syamsuddin.grosir@gmail.com',
    address: 'Jl. Veteran No. 45, Watampone, Bone',
    regionCode: RegionCode.WATAMPONE,
    segment: CustomerSegment.B2B_GROSIR,
    businessName: 'Toko Berkah Mandiri Bone',
    businessProfiles: [
      {
        businessIndex: 1,
        businessCode: '102-260915-05-01-900',
        businessName: 'Toko Berkah Mandiri Bone',
        businessType: 'Toko / Grosir',
        businessLocation: 'Watampone',
        picName: 'Haji Syamsuddin',
        picRole: 'Owner',
        picWhatsapp: '082199001122',
        businessModel: 'Single Ownership',
      },
    ],
    surveyData: {
      outletCount: 1,
      monthlySpendEstimate: '> Rp 150 Jt',
      mainRawMaterials: ['Bahan Masakan', 'Bumbu Dapur'],
      posUsage: 'Pakai',
      managementStructure: 'Ada Divisi (Keuangan/Pajak/Operasional)',
      businessGoals: ['Tambah Bisnis', 'Buka Cabang'],
    },
    // Sprint 7: Loyalty Tier (Rolling 3 Bulan 120M = PLATINUM)
    currentTier: CustomerTier.PLATINUM,
    rolling3MonthAvgSpend: 120000000,
    monthlySpendsRecent: [115000000, 125000000, 120000000],
    tierEvaluatedAt: '2026-09-01',
    tierExpiresAt: '2026-09-30',
    downgradeWarning: false,
    orientalPayBalance: 3100000,
    influencerAffiliateCode: 'SYAMSUDDIN',
    orientalPayHistory: [],
    totalLoyaltyPoints: 540,
    totalSpendMonth: 120000000,
    doorprizeCouponsCount: 42,
    doorprizeCoupons: ['ORT-KUP2609-0050', 'ORT-KUP2609-0051', 'ORT-KUP2609-0052'],
    pointHistory: [
      {
        id: 'mut-301',
        memberId: 'mem-003',
        date: '2026-09-19, 16:00',
        invoiceNumber: 'INV-GRO-882012',
        channel: 'GROSIR',
        description: 'Pembelian Partai Besar Minyak 50 Dus & Gula 20 Karung',
        transactionAmount: 48000000,
        pointsEarned: 240,
        couponsEarned: 32,
      },
    ],
    // Sprint 9 Additions: Plafon & Overdue Lock (Overlimit & Overdue demo)
    creditLimit: 50000000,
    currentOutstandingReceivables: 54000000,
    hasOverdueInvoices: true,
    overdueInvoiceNumbers: [
      'INV-GRO-881920 (Rp 28.000.000, Jatuh Tempo: 10 Sep 2026)',
      'INV-GRO-881955 (Rp 26.000.000, Jatuh Tempo: 15 Sep 2026)',
    ],
    topAllowedDays: 30,
    isActive: true,
    registeredAt: new Date('2026-09-15'),
  },
  {
    id: 'mem-004',
    memberCode: '101-260910-04',
    barcode: '82000084',
    fullName: 'David Prasetyo (Purchasing Mgr)',
    nik: '7371052002840004',
    phone: '081141558899',
    birthDate: '1984-02-20',
    gender: 'Pria',
    email: 'purchasing@clarion-makassar.com',
    address: 'Jl. A.P. Pettarani No. 3, Makassar',
    regionCode: RegionCode.MAKASSAR,
    segment: CustomerSegment.B2B_HOTEL,
    businessName: 'Grand Clarion Hotel & Convention',
    businessProfiles: [
      {
        businessIndex: 1,
        businessCode: '101-260910-04-01-100',
        businessName: 'Grand Clarion Hotel & Convention',
        businessType: 'Hotel & Hospitality',
        businessLocation: 'Pettarani, Makassar',
        picName: 'David Prasetyo',
        picRole: 'Purchasing Manager',
        picWhatsapp: '081141558899',
        businessModel: 'Corporate / PT',
        featuredProducts: ['Buffet Breakfast', 'Fine Dining Resto'],
      },
    ],
    surveyData: {
      outletCount: 1,
      monthlySpendEstimate: '> Rp 150 Jt',
      mainRawMaterials: ['Bahan Pokok Beras & Gula', 'Minyak Goreng', 'Bumbu Hotel'],
      posUsage: 'Pakai',
      managementStructure: 'Ada Divisi (Keuangan/Pajak/Operasional)',
      businessGoals: ['Efisiensi Biaya Bahan Baku'],
    },
    // Sprint 7: Loyalty Tier (Rolling 3 Bulan 145M = PLATINUM)
    currentTier: CustomerTier.PLATINUM,
    rolling3MonthAvgSpend: 145000000,
    monthlySpendsRecent: [140000000, 150000000, 145000000],
    tierEvaluatedAt: '2026-09-01',
    tierExpiresAt: '2026-09-30',
    downgradeWarning: false,
    orientalPayBalance: 4200000,
    influencerAffiliateCode: 'CLARION',
    orientalPayHistory: [],
    totalLoyaltyPoints: 890,
    totalSpendMonth: 145000000,
    doorprizeCouponsCount: 65,
    doorprizeCoupons: ['ORT-KUP2609-0060', 'ORT-KUP2609-0061'],
    pointHistory: [],
    // Sprint 9 Additions: Plafon & Overdue Lock
    creditLimit: 100000000,
    currentOutstandingReceivables: 32000000,
    hasOverdueInvoices: false,
    overdueInvoiceNumbers: [],
    topAllowedDays: 30,
    isActive: true,
    registeredAt: new Date('2026-09-10'),
  },
  {
    id: 'mem-005',
    memberCode: '101-260912-05',
    barcode: '82000085',
    fullName: 'Kevin Alamsyah (Owner)',
    nik: '7371081504930005',
    phone: '081342119988',
    birthDate: '1993-04-15',
    gender: 'Pria',
    email: 'kevin@kenangansenja.id',
    address: 'Jl. Boulevard Panakkukang No. 88, Makassar',
    regionCode: RegionCode.MAKASSAR,
    segment: CustomerSegment.B2B_CAFE,
    businessName: 'Kopi Kenangan Senja Cafe & Eatery',
    businessProfiles: [
      {
        businessIndex: 1,
        businessCode: '101-260912-05-01-100',
        businessName: 'Kopi Kenangan Senja Cafe & Eatery',
        businessType: 'Café & Eatery',
        businessLocation: 'Boulevard Panakkukang',
        picName: 'Kevin Alamsyah',
        picRole: 'Owner',
        picWhatsapp: '081342119988',
        businessModel: 'Single Ownership',
        featuredProducts: ['Artisan Coffee', 'Pastry & Western Meals'],
      },
    ],
    surveyData: {
      outletCount: 2,
      monthlySpendEstimate: 'Rp. 80 Jt - 120 Jt',
      mainRawMaterials: ['Kopi & Susu', 'Minyak Goreng', 'Bahan Roti & Sirup'],
      posUsage: 'Pakai',
      managementStructure: 'Ada Divisi (Keuangan/Pajak/Operasional)',
      businessGoals: ['Ekspansi Outlet', 'Standardisasi Suplai'],
    },
    // Sprint 7: Loyalty Tier (Rolling 3 Bulan 68M = GOLD)
    currentTier: CustomerTier.GOLD,
    rolling3MonthAvgSpend: 68000000,
    monthlySpendsRecent: [65000000, 71000000, 68000000],
    tierEvaluatedAt: '2026-09-01',
    tierExpiresAt: '2026-09-30',
    downgradeWarning: false,
    orientalPayBalance: 850000,
    influencerAffiliateCode: 'KEVINCOFFEE',
    orientalPayHistory: [
      {
        id: 'op-tx-201',
        memberId: 'mem-005',
        type: 'TOPUP',
        amount: 850000,
        balanceAfter: 850000,
        description: 'Deposit Saldo Dompet Oriental Pay',
        createdAt: '2026-09-12T11:00:00Z',
      },
    ],
    totalLoyaltyPoints: 410,
    totalSpendMonth: 68000000,
    doorprizeCouponsCount: 30,
    doorprizeCoupons: ['ORT-KUP2609-0070'],
    pointHistory: [],
    // Sprint 9 Additions: Plafon & Overdue Lock
    creditLimit: 20000000,
    currentOutstandingReceivables: 6500000,
    hasOverdueInvoices: false,
    overdueInvoiceNumbers: [],
    topAllowedDays: 14,
    isActive: true,
    registeredAt: new Date('2026-09-12'),
  },
  {
    id: 'mem-006',
    memberCode: '102-260914-06',
    barcode: '82000086',
    fullName: 'Andi Mappaselling (Roaster)',
    nik: '7308020909900006',
    phone: '082345678901',
    birthDate: '1990-09-09',
    gender: 'Pria',
    email: 'andi@sulawesicoffee.id',
    address: 'Jl. Ahmad Yani No. 50, Watampone',
    regionCode: RegionCode.WATAMPONE,
    segment: CustomerSegment.B2B_COFFEESHOP,
    businessName: 'Aroma Sulawesi Specialty Coffee',
    businessProfiles: [
      {
        businessIndex: 1,
        businessCode: '102-260914-06-01-100',
        businessName: 'Aroma Sulawesi Specialty Coffee',
        businessType: 'Coffeeshop / Roastery',
        businessLocation: 'Watampone',
        picName: 'Andi Mappaselling',
        picRole: 'Owner & Head Roaster',
        picWhatsapp: '082345678901',
        businessModel: 'Single Ownership',
        featuredProducts: ['Specialty Coffee Beans', 'Cold Brew', 'Snacks'],
      },
    ],
    surveyData: {
      outletCount: 1,
      monthlySpendEstimate: 'Rp. 30 Jt - 50 Jt',
      mainRawMaterials: ['Green Beans', 'Kopi Kemasan', 'Susu UHT & Gula'],
      posUsage: 'Pakai',
      managementStructure: 'Tidak ada, saya mengelola Sendiri',
      businessGoals: ['Buka Cabang'],
    },
    // Sprint 7: Loyalty Tier (Rolling 3 Bulan 34M = SILVER)
    currentTier: CustomerTier.SILVER,
    rolling3MonthAvgSpend: 34000000,
    monthlySpendsRecent: [32000000, 36000000, 34000000],
    tierEvaluatedAt: '2026-09-01',
    tierExpiresAt: '2026-09-30',
    downgradeWarning: false,
    orientalPayBalance: 320000,
    influencerAffiliateCode: 'ANDIROAST',
    orientalPayHistory: [
      {
        id: 'op-tx-301',
        memberId: 'mem-006',
        type: 'TOPUP',
        amount: 320000,
        balanceAfter: 320000,
        description: 'Deposit Saldo Dompet Oriental Pay',
        createdAt: '2026-09-14T10:00:00Z',
      },
    ],
    totalLoyaltyPoints: 215,
    totalSpendMonth: 34000000,
    doorprizeCouponsCount: 16,
    doorprizeCoupons: ['ORT-KUP2609-0080'],
    pointHistory: [],
    // Sprint 9 Additions: Plafon & Overdue Lock
    creditLimit: 25000000,
    currentOutstandingReceivables: 8000000,
    hasOverdueInvoices: false,
    overdueInvoiceNumbers: [],
    topAllowedDays: 14,
    isActive: true,
    registeredAt: new Date('2026-09-14'),
  },
];

// Initial RBAC System Users
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-001',
    name: 'Chandra Santoso',
    email: 'chandra.owner@oriental.co.id',
    phone: '08119888201',
    role: UserRole.SUPER_ADMIN,
    tenantId: 'tenant-oriental-01',
    isActive: true,
    createdAt: new Date('2026-01-01'),
  },
  {
    id: 'usr-002',
    name: 'Budi Wijaya',
    email: 'budi.manager@oriental.co.id',
    phone: '08123456701',
    role: UserRole.ADMIN_MANAGER,
    tenantId: 'tenant-oriental-01',
    delegatedById: 'usr-001',
    delegatedByName: 'Chandra Santoso (Owner)',
    isActive: true,
    createdAt: new Date('2026-01-15'),
  },
  {
    id: 'usr-003',
    name: 'Siti Rahma',
    email: 'siti.kasir@oriental.co.id',
    phone: '08139876543',
    role: UserRole.ADMIN_KASIR,
    tenantId: 'tenant-oriental-01',
    delegatedById: 'usr-002',
    delegatedByName: 'Budi Wijaya (Manager)',
    isActive: true,
    createdAt: new Date('2026-02-01'),
  },
  {
    id: 'usr-004',
    name: 'Joko Prayitno',
    email: 'joko.gudang@oriental.co.id',
    phone: '08156789123',
    role: UserRole.STAFF_GUDANG,
    tenantId: 'tenant-oriental-01',
    delegatedById: 'usr-002',
    delegatedByName: 'Budi Wijaya (Manager)',
    isActive: true,
    createdAt: new Date('2026-02-10'),
  },
  {
    id: 'usr-005',
    name: 'Rahmat Hidayat',
    email: 'rahmat.waste@oriental.co.id',
    phone: '08178912345',
    role: UserRole.OPERATOR_WASTE,
    tenantId: 'tenant-oriental-01',
    delegatedById: 'usr-002',
    delegatedByName: 'Budi Wijaya (Manager)',
    isActive: true,
    createdAt: new Date('2026-02-15'),
  },
  {
    id: 'usr-reg-01',
    name: 'Ir. Faisal Rahman (Regional Manager)',
    email: 'faisal.regional@oriental.co.id',
    phone: '081144229900',
    role: UserRole.REGIONAL_MANAGER,
    tenantId: 'tenant-oriental-01',
    delegatedById: 'usr-001',
    delegatedByName: 'Chandra (Owner)',
    isActive: true,
    createdAt: new Date('2026-03-01'),
  },
];

// INITIAL_PRODUCTS imported from ../data/initialProducts (50 products across categories)

// ==========================================
// Initial Mock Data: Waste Purchasing (Minyak Jelantah focus)
// ==========================================
const INITIAL_WASTE_CATEGORIES: WasteCategoryRate[] = [
  {
    id: 'wcat-uco-01',
    code: 'UCO-JELANTAH',
    name: 'Minyak Jelantah Super (Bening / Ringan)',
    unit: 'kg',
    buyingPricePerKg: 8000,
    factorySellingPricePerKg: 10500,
    description: 'Minyak jelantah sisa penggorengan restoran/kafe dengan kadar kotoran < 3%',
    minQualityNotes: 'Kadar air maksimal 2%, bebas bau tengik berat',
    isActive: true,
  },
  {
    id: 'wcat-uco-02',
    code: 'UCO-STANDAR',
    name: 'Minyak Jelantah Standar (Cokelat)',
    unit: 'kg',
    buyingPricePerKg: 7500,
    factorySellingPricePerKg: 9500,
    description: 'Minyak jelantah sisa rumah tangga dan warung makan',
    minQualityNotes: 'Kadar kotoran maksimal 5%',
    isActive: true,
  },
  {
    id: 'wcat-kardus',
    code: 'NON-UCO-KARDUS',
    name: 'Kardus & Karton Bekas',
    unit: 'kg',
    buyingPricePerKg: 1500,
    factorySellingPricePerKg: 2200,
    description: 'Kardus kemasan cokelat bersih dan kering (Coming Soon - Addendum v2.1)',
    minQualityNotes: 'Kering, tanpa staples besar',
    isActive: false,
    isComingSoon: true,
  },
  {
    id: 'wcat-plastik',
    code: 'NON-UCO-PLASTIK',
    name: 'Plastik HD / PET Bening',
    unit: 'kg',
    buyingPricePerKg: 3000,
    factorySellingPricePerKg: 4500,
    description: 'Botol plastik dan kemasan bening terpilah (Coming Soon - Addendum v2.1)',
    minQualityNotes: 'Dibilas bersih tanpa label lem tebal',
    isActive: false,
    isComingSoon: true,
  },
  {
    id: 'wcat-logam',
    code: 'NON-UCO-LOGAM',
    name: 'Kaleng & Logam Aluminium',
    unit: 'kg',
    buyingPricePerKg: 12000,
    factorySellingPricePerKg: 16000,
    description: 'Kaleng minuman dan wadah aluminium bersih (Coming Soon - Addendum v2.1)',
    minQualityNotes: 'Dipipihkan, tanpa residu cairan asam',
    isActive: false,
    isComingSoon: true,
  },
];

const INITIAL_WASTE_PARTNERS: WasteLocationPartner[] = [
  {
    id: 'prt-mks-01',
    code: 'DP-MKS-SENTRA',
    name: 'Sentra Kuliner Losari Makassar',
    location: 'Jl. Penghibur No. 88, Makassar',
    contactPerson: 'H. Daeng Rapi',
    phone: '+62 811-4400-991',
    profitSharePct: 5, // Flat 5% dari total nilai beli yang dibayarkan kepada nasabah (PRD v2.1 Addendum §2.3)
    totalWeightCollectedKg: 450,
    totalEarnings: 180000,
    unpaidEarnings: 180000,
    isActive: true,
  },
  {
    id: 'prt-mks-02',
    code: 'DP-GWA-SOMBA',
    name: 'Mitra Transit Somba Opu Gowa',
    location: 'Jl. Sultan Hasanuddin No. 12, Gowa',
    contactPerson: 'Ibu Ratna Dewi',
    phone: '+62 852-5511-332',
    profitSharePct: 5, // Flat 5% dari total nilai beli
    totalWeightCollectedKg: 280,
    totalEarnings: 105000,
    unpaidEarnings: 105000,
    isActive: true,
  },
  {
    id: 'prt-bne-01',
    code: 'DP-BNE-WATAMPONE',
    name: 'Drop Point Oriental Watampone Bone',
    location: 'Jl. Ahmad Yani No. 45, Watampone',
    contactPerson: 'Andi Mallombassi',
    phone: '+62 821-9988-771',
    profitSharePct: 5, // Flat 5% dari total nilai beli
    totalWeightCollectedKg: 190,
    totalEarnings: 71250,
    unpaidEarnings: 71250,
    isActive: true,
  },
];

const INITIAL_SETTLEMENT_CLAIMS: WastePartnerSettlementClaim[] = [
  {
    id: 'wsc-202609-01',
    claimNumber: 'WSC-202609-001',
    partnerId: 'prt-mks-01',
    partnerName: 'Sentra Kuliner Losari Makassar',
    periodMonth: '2026-09',
    totalKgCollected: 450,
    totalCustomerPayout: 3600000,
    profitSharePct: 5,
    claimAmount: 180000,
    status: 'PAID',
    settledAt: '2026-09-25T17:00:00Z',
    settledBy: 'Chandra Santoso (Owner)',
  },
  {
    id: 'wsc-202609-02',
    claimNumber: 'WSC-202609-002',
    partnerId: 'prt-mks-02',
    partnerName: 'Mitra Transit Somba Opu Gowa',
    periodMonth: '2026-09',
    totalKgCollected: 280,
    totalCustomerPayout: 2100000,
    profitSharePct: 5,
    claimAmount: 105000,
    status: 'APPROVED',
  },
];

const INITIAL_INFLUENCER_LINKS: InfluencerProductLink[] = [
  {
    id: 'inf-link-001',
    memberId: 'mem-001',
    affiliateCode: 'CATUR88',
    productId: 'prod-minyak',
    productName: 'Minyak Goreng Oriental 2L',
    productPrice: 34000,
    commissionPct: 1.0,
    shareUrl: 'http://localhost:3000/retail-pos?ref=CATUR88&prod=prod-minyak',
    clicksCount: 142,
    salesCount: 18,
    totalCommissionEarned: 61200,
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'inf-link-002',
    memberId: 'mem-005',
    affiliateCode: 'KEVINCOFFEE',
    productId: 'prod-kopi',
    productName: 'Kopi Susu Gula Aren 250ml',
    productPrice: 12000,
    commissionPct: 1.0,
    shareUrl: 'http://localhost:3000/retail-pos?ref=KEVINCOFFEE&prod=prod-kopi',
    clicksCount: 385,
    salesCount: 64,
    totalCommissionEarned: 76800,
    createdAt: '2026-09-18T10:00:00Z',
  },
];

const INITIAL_WASTE_HISTORY: WastePurchaseRecord[] = [
  {
    id: 'wst-101',
    receiptNumber: 'WST-2609-001',
    sellerMemberId: 'mem-001',
    sellerName: 'Budi Santoso (Warung Berkah)',
    operatorId: 'usr-004',
    locationPartnerId: 'prt-mks-01',
    locationPartnerName: 'Sentra Kuliner Losari Makassar',
    wasteCategory: 'Minyak Jelantah Super (Bening / Ringan)',
    grossWeightKg: 25.5,
    tareWeightKg: 0.5,
    netWeightKg: 25.0,
    pricePerKg: 8000,
    factorySellingPricePerKg: 10500,
    totalCostPaid: 200000,
    grossMargin: 62500,
    partnerProfitSharePct: 10,
    partnerEarnedAmount: 6250,
    pointsAwarded: 25, // 1 kg = 1 Poin
    qualityGrade: 'SUPER',
    notes: 'Jerigen 25L bersih',
    createdAt: new Date(),
  },
];

// ==========================================
// Initial Mock Data: White Label Maklon
// ==========================================
const INITIAL_WHITE_LABEL_VENDORS: WhiteLabelVendor[] = [
  {
    id: 'vdr-01',
    code: 'VDR-BPN-01',
    vendorName: 'CV Berkah Pangan Nusantara',
    companyName: 'CV Berkah Pangan Nusantara',
    contactPerson: 'H. Sudirman',
    phone: '+62 812-4112-9901',
    address: 'Kawasan Industri Makassar (KIMA) Kav. 14, Makassar',
    pirtNumber: 'P-IRT 2067371010452-27',
    bpomNumber: 'BPOM RI MD 235628001099',
    halalCertNumber: 'ID73210000456120324',
    qcSlaStandard: 'ISO 22000 & Halal Assurance System Level A',
    category: 'Bakery & Pastry',
    memberId: 'mem-vdr-01',
    isActive: true,
  },
  {
    id: 'vdr-02',
    code: 'VDR-SRM-02',
    vendorName: 'PT Samudra Rasa Makassar',
    companyName: 'PT Samudra Rasa Makassar',
    contactPerson: 'Ibu Veronica Tan',
    phone: '+62 813-8822-4411',
    address: 'Jl. Ir. Sutami No. 102, Makassar',
    pirtNumber: 'P-IRT 2117371020881-28',
    bpomNumber: 'BPOM RI MD 255628002133',
    halalCertNumber: 'ID73110000889210524',
    qcSlaStandard: 'HACCP & Good Manufacturing Practices (GMP)',
    category: 'Saus & Bumbu Olahan',
    memberId: 'mem-vdr-02',
    isActive: true,
  },
];

const INITIAL_WHITE_LABEL_CONTRACTS: WhiteLabelContract[] = [
  {
    id: 'ctr-01',
    contractNumber: 'MKL-2026-001',
    vendorId: 'vdr-01',
    vendorName: 'CV Berkah Pangan Nusantara',
    productName: 'Roti Manis Oriental Bakery (Karton @ 24 Pcs)',
    brandName: 'Oriental Bakery & Pastry',
    targetQuantity: 500,
    unit: 'Karton',
    productionCostPerUnit: 60000,
    sellingPriceToB2B: 85000,
    totalContractValue: 30000000,
    status: 'ACTIVE',
    startDate: '2026-09-01',
    endDate: '2026-12-31',
  },
  {
    id: 'ctr-02',
    contractNumber: 'MKL-2026-002',
    vendorId: 'vdr-02',
    vendorName: 'PT Samudra Rasa Makassar',
    productName: 'Saus Sambal Khas Oriental Pouch 1 Kg',
    brandName: 'Oriental Chef Selection',
    targetQuantity: 1000,
    unit: 'Pouch',
    productionCostPerUnit: 14000,
    sellingPriceToB2B: 20000,
    totalContractValue: 14000000,
    status: 'ACTIVE',
    startDate: '2026-09-15',
    endDate: '2026-11-30',
  },
];

const INITIAL_WHITE_LABEL_CATALOG: WhiteLabelProductItem[] = [
  {
    id: 'wlp-01',
    contractId: 'ctr-01',
    vendorId: 'vdr-01',
    vendorName: 'CV Berkah Pangan Nusantara',
    name: 'Roti Manis Oriental Bakery (Karton @ 24 Pcs)',
    sku: 'SKU-WHL-ROTI-01',
    category: 'Bakery',
    unit: 'Karton',
    priceToB2B: 85000,
    stockAvailable: 240,
    description: 'Roti manis empuk kualitas bakery kafe, higienis kemasan satuan isi 24 pcs.',
  },
  {
    id: 'wlp-02',
    contractId: 'ctr-02',
    vendorId: 'vdr-02',
    vendorName: 'PT Samudra Rasa Makassar',
    name: 'Saus Sambal Khas Oriental Pouch 1 Kg',
    sku: 'SKU-WHL-SAUS-01',
    category: 'Saus & Bumbu',
    unit: 'Pouch',
    priceToB2B: 20000,
    stockAvailable: 480,
    description: 'Saus sambal pedas gurih standar restoran hotel dan kafe, kemasan pouch 1 kg.',
  },
];

const INITIAL_WHITE_LABEL_RECEIPTS: WhiteLabelBatchReceipt[] = [
  {
    id: 'grn-01',
    receiptNumber: 'GRN-2609-001',
    contractId: 'ctr-01',
    contractNumber: 'MKL-2026-001',
    vendorId: 'vdr-01',
    vendorName: 'CV Berkah Pangan Nusantara',
    productName: 'Roti Manis Oriental Bakery (Karton @ 24 Pcs)',
    batchNumber: 'BATCH-BPN-2609A',
    receivedQuantity: 100,
    unit: 'Karton',
    costPerUnit: 60000,
    totalValue: 6000000,
    qcPassed: true,
    qcNotes: 'Tekstur lembut, kemasan vakum rapi, lolos uji mikrobiologi awal.',
    receivedDate: '2026-09-20',
  },
];

const INITIAL_WHITE_LABEL_ORDERS: WhiteLabelB2BOrder[] = [
  {
    id: 'wlo-01',
    orderNumber: 'WLO-2609-001',
    customerMemberId: 'mem-003',
    customerName: 'Kopi Kenangan Senja Cafe',
    customerSegment: 'B2B_CAFE',
    productId: 'wlp-01',
    productName: 'Roti Manis Oriental Bakery (Karton @ 24 Pcs)',
    quantity: 5,
    unitPrice: 85000,
    totalAmount: 425000,
    pointsAwarded: 42, // Rp 10.000 = 1 Poin untuk customer B2B UKM
    orderDate: '2026-09-22',
    status: 'DELIVERED',
  },
];

// ==========================================
// Initial Mock Data: Standing Orders (Weekly Delivery)
// ==========================================
const INITIAL_STANDING_ORDERS: StandingOrder[] = [
  {
    id: 'so-001',
    orderNumber: 'SO-202609-001',
    customerMemberId: 'mem-005',
    customerName: 'Kopi Kenangan Senja Cafe & Eatery',
    customerSegment: 'B2B_CAFE',
    deliveryFrequency: 'RABU_SABTU',
    frequencyLabel: 'Setiap Hari Rabu & Sabtu',
    deliveryTimeSlot: 'Pagi (06:00 - 09:00 WITA) - Sebelum Buka Outlet',
    deliveryAddress: 'Jl. Boulevard Panakkukang No. 88, Makassar',
    items: [
      {
        productId: 'prod-minyak',
        productName: 'Minyak Goreng Oriental 2L (Karton @ 6 Pouch)',
        unit: 'Karton',
        quantity: 2,
        unitPrice: 190000,
        subtotal: 380000,
      },
      {
        productId: 'prod-kopi',
        productName: 'Kopi Susu Gula Aren 250ml (Karton @ 12 Botol)',
        unit: 'Karton',
        quantity: 3,
        unitPrice: 130000,
        subtotal: 390000,
      },
    ],
    totalAmountPerDelivery: 770000,
    nextDeliveryDate: '2026-09-26',
    status: 'ACTIVE',
    createdAt: new Date('2026-09-10T08:00:00Z'),
  },
  {
    id: 'so-002',
    orderNumber: 'SO-202609-002',
    customerMemberId: 'mem-004',
    customerName: 'Grand Clarion Makassar Hotel',
    customerSegment: 'B2B_HOTEL',
    deliveryFrequency: 'SETIAP_SENIN',
    frequencyLabel: 'Setiap Hari Senin',
    deliveryTimeSlot: 'Pagi (06:00 - 09:00 WITA) - Receiving Kitchen',
    deliveryAddress: 'Jl. A.P. Pettarani No. 3, Makassar',
    items: [
      {
        productId: 'prod-beras',
        productName: 'Beras Premium Pulen 5Kg (Bal @ 5 Karung)',
        unit: 'Bal',
        quantity: 5,
        unitPrice: 345000,
        subtotal: 1725000,
      },
      {
        productId: 'prod-gula',
        productName: 'Gula Pasir Kristal Karung 50Kg',
        unit: 'Karung',
        quantity: 2,
        unitPrice: 785000,
        subtotal: 1570000,
      },
    ],
    totalAmountPerDelivery: 3295000,
    nextDeliveryDate: '2026-09-28',
    status: 'ACTIVE',
    createdAt: new Date('2026-09-12T08:00:00Z'),
  },
];

// ==========================================
// Initial Mock Data: Referral Commissions & Withdrawals
// ==========================================
const INITIAL_COMMISSIONS: ReferralCommission[] = [
  {
    id: 'comm-biz-001',
    referralType: ReferralType.BUSINESS,
    referrerId: 'mem-001',
    refereeId: 'mem-003',
    sourceTransactionId: 'INV-GRO-882012',
    transactionAmount: 48000000,
    commissionRatePct: 0.5,
    commissionAmount: 240000, // 0.5% * 48jt
    isPaidOut: false,
    createdAt: new Date('2026-09-19T16:00:00Z'),
  },
  {
    id: 'comm-inf-001',
    referralType: ReferralType.INFLUENCER,
    referrerId: 'mem-001',
    refereeId: 'cust-anon-09',
    sourceTransactionId: 'INV-RET-774102',
    transactionAmount: 4500000,
    commissionRatePct: 1.0,
    commissionAmount: 45000, // 1.0% * 4.5jt
    isPaidOut: false,
    createdAt: new Date('2026-09-20T14:30:00Z'),
  },
];

const INITIAL_WITHDRAWALS: CommissionWithdrawalRequest[] = [
  {
    id: 'wdr-001',
    requestNumber: 'WDR-202609-0001',
    memberId: 'mem-001',
    memberName: 'Pak Catur (RM Maliku)',
    amount: 100000,
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '8910-234-551',
    accountHolderName: 'Catur Santoso',
    status: 'TRANSFERRED',
    requestedAt: new Date('2026-09-15T09:00:00Z'),
    processedAt: new Date('2026-09-15T11:00:00Z'),
  },
];

// ==========================================
// Initial Mock Data: Oriental Learn & Workshops (Sprint 6)
// ==========================================
const INITIAL_COURSES: CourseModule[] = [
  {
    id: 'crs-001',
    title: 'Manajemen Food Cost & Recipe Costing Standar SAK UKM Kuliner',
    category: 'FOOD_COSTING',
    categoryLabel: 'Manajemen Food Cost',
    description:
      'Panduan praktis menghitung HPP per porsi menu, yield bahan baku mentah, margin kotor ideal (65-70%), dan pengendalian waste dapur.',
    durationMinutes: 45,
    videoUrl: 'https://assets.oriental.co.id/videos/learn-food-costing-01.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
    level: 'Menengah',
    instructor: 'Chef Chandra Santoso',
    instructorRole: 'Head of Culinary & Operations',
    quizQuestions: [
      {
        id: 'q1-1',
        question:
          'Berapakah batas ideal persentase Food Cost (HPP Makanan) terhadap harga jual untuk bisnis resto/kafe yang sehat?',
        options: ['10% - 15%', '28% - 35%', '50% - 60%', '70% - 80%'],
        correctAnswerIndex: 1, // 28% - 35%
        explanation:
          'Standar industri kuliner dan SAK menetapkan food cost optimal berada pada rentang 28% hingga 35% untuk mempertahankan margin kotor minimal 65%.',
      },
      {
        id: 'q1-2',
        question:
          'Jika 1 Zak Tepung 25 Kg dibeli seharga Rp 245.000 dan menghasilkan 100 porsi roti, berapakah biaya tepung per porsi?',
        options: ['Rp 1.500', 'Rp 2.450', 'Rp 3.500', 'Rp 4.200'],
        correctAnswerIndex: 1, // Rp 2.450
        explanation: 'Rp 245.000 / 100 porsi = Rp 2.450 per porsi.',
      },
      {
        id: 'q1-3',
        question: 'Komponen apakah yang termasuk dalam perhitungan Harga Pokok Penjualan (HPP) bahan baku?',
        options: [
          'Biaya bahan baku langsung + biaya penyusutan gedung',
          'Persediaan awal + Pembelian bersih - Persediaan akhir',
          'Gaji kasir + Sewa tempat',
          'Pajak restoran 10% + komisi influencer',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Rumus baku SAK HPP Barang Dagang/Bahan Baku = Persediaan Awal + Pembelian Bersih - Persediaan Akhir.',
      },
    ],
  },
  {
    id: 'crs-002',
    title: 'Standardisasi Sanitasi Dapur & Pengelolaan Minyak Jelantah (UCO)',
    category: 'SANITASI_WASTE',
    categoryLabel: 'Sanitasi & Circular Economy',
    description:
      'Standardisasi penanganan limbah minyak jelantah sisa penggorengan kafe/resto, pencegahan kontaminasi karsinogenik, dan monetisasi bagi hasil.',
    durationMinutes: 30,
    videoUrl: 'https://assets.oriental.co.id/videos/learn-sanitasi-waste-02.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
    level: 'Pemula',
    instructor: 'drh. Siti Rahmawati',
    instructorRole: 'Quality & Food Safety Auditor',
    quizQuestions: [
      {
        id: 'q2-1',
        question:
          'Berapa kali batas maksimal penggunaan minyak goreng sebelum wajib disetor sebagai limbah jelantah (UCO)?',
        options: [
          '1 kali saja',
          'Maksimal 3 - 4 kali atau saat warna mulai gelap/berbusa',
          'Bebas hingga hitam pekat',
          '10 kali',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Minyak yang dipanaskan berulang lebih dari 3-4 kali mengalami oksidasi dan peningkatan senyawa polar karsinogenik sehingga wajib disetor.',
      },
      {
        id: 'q2-2',
        question:
          'Berapakah nilai reward loyalitas penyetoran limbah minyak jelantah ke Oriental Ecosystem?',
        options: ['10 kg = 1 Poin', '1 kg = 1 Poin Loyalitas', '1 liter = 10 Poin', 'Tidak ada poin'],
        correctAnswerIndex: 1,
        explanation:
          'Sesuai regulasi ekosistem sirkular Oriental, setiap 1 kg minyak jelantah yang disetor bernilai 1 Poin loyalitas member.',
      },
    ],
  },
  {
    id: 'crs-003',
    title: 'Strategi Pemasaran Digital & Optimasi Mesin Referral Afiliasi',
    category: 'DIGITAL_MARKETING',
    categoryLabel: 'Pemasaran & Afiliasi',
    description:
      'Cara menghasilkan omset pasif melalui program referral bisnis 0.5% dan tautan afiliasi produk 1.0% untuk komunitas kuliner.',
    durationMinutes: 40,
    videoUrl: 'https://assets.oriental.co.id/videos/learn-referral-marketing-03.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600',
    level: 'Menengah',
    instructor: 'Kevin Alamsyah',
    instructorRole: 'Growth & Affiliate Strategist',
    quizQuestions: [
      {
        id: 'q3-1',
        question:
          'Berapakah ambang batas belanja bulanan bagi pengusul (referrer) untuk memenuhi syarat komisi referral bisnis 0.5%?',
        options: ['Rp 10 Juta', 'Rp 30 Juta', 'Rp 60 Juta', 'Rp 100 Juta'],
        correctAnswerIndex: 2, // Rp 60 Juta
        explanation:
          'Ambang batas belanja bulanan pengusul adalah minimal Rp 60 Juta dan rekanan minimal Rp 30 Juta.',
      },
      {
        id: 'q3-2',
        question:
          'Berapakah komisi penjualan teratribusi yang diperoleh mitra melalui tautan afiliasi produk influencer?',
        options: ['0.1%', '0.5%', '1.0%', '5.0%'],
        correctAnswerIndex: 2, // 1.0%
        explanation:
          'Mesin referral influencer memberikan komisi flat sebesar 1.0% dari nilai transaksi produk yang dibeli melalui link.',
      },
    ],
  },
];

const INITIAL_WORKSHOPS: OfflineWorkshop[] = [
  {
    id: 'wks-001',
    title: 'Masterclass Operasional & Food Costing Kafe/Resto Modern 2026',
    location: 'Makassar',
    address: 'Sentra Kuliner Losari, Jl. Penghibur No. 88, Makassar',
    date: '2026-10-10',
    timeSlot: '09:00 - 15:00 WITA',
    instructor: 'Chef Chandra Santoso & Tim Akuntan Oriental',
    quota: 30,
    registeredCount: 22,
    description:
      'Pelatihan tatap muka intensif: simulasi bedah recipe costing, negosiasi pasokan grosir, tata kelola kasir dan audit kepatuhan SAK.',
    isFull: false,
  },
  {
    id: 'wks-002',
    title: 'Workshop Sertifikasi Higiene Sanitasi & Circular Economy Jelantah',
    location: 'Watampone, Bone',
    address: 'Aula Oriental Hub Bone, Jl. Ahmad Yani No. 12, Watampone',
    date: '2026-10-18',
    timeSlot: '13:00 - 17:00 WITA',
    instructor: 'drh. Siti Rahmawati',
    quota: 25,
    registeredCount: 18,
    description:
      'Standarisasi pemisahan limbah dapur komersial, audit mutu jelantah ekspor, dan registrasi titik transit mitra bagi hasil.',
    isFull: false,
  },
];

const INITIAL_CERTIFICATES: DigitalCertificate[] = [
  {
    id: 'cert-001',
    certificateNumber: 'CERT-ORT-202609-0001',
    memberId: 'mem-001',
    memberName: 'Pak Catur Santoso',
    businessName: 'RM Maliku Fried Chicken',
    courseTitle: 'Manajemen Food Cost & Recipe Costing Standar SAK UKM Kuliner',
    category: 'Food Costing & Akuntansi',
    scorePct: 100,
    issueDate: '2026-09-20',
    qrCodeUrl: 'https://oriental.co.id/verify-cert/CERT-ORT-202609-0001',
    verificationHash: 'SHA256-8A91FF2091C8092B',
  },
];

export const INITIAL_OUTLETS: OutletLocation[] = [
  {
    id: 'OUTLET-WATAMPONE-01',
    code: 'WTP-01',
    name: 'Oriental Pusat Watampone',
    region: 'WATAMPONE',
    address: 'Jl. Merdeka No. 88, Watampone, Kab. Bone',
    phone: '081242990011',
    managerName: 'H. Abdul Rauf',
    isHeadquarters: true,
    businessLines: {
      hasRetail: true,
      hasGrosir: true,
      hasUkmSupply: true,
      hasWaste: true,
      hasWhiteLabel: true,
    },
    warehouseCapacityCbm: 2500,
    isActive: true,
    openedAt: '2020-01-15',
  },
  {
    id: 'OUTLET-MAKASSAR-01',
    code: 'MKS-01',
    name: 'Oriental Cabang Makassar',
    region: 'MAKASSAR',
    address: 'Jl. Urip Sumoharjo No. 120, Kota Makassar',
    phone: '081141772233',
    managerName: 'Farhan Maulana',
    isHeadquarters: false,
    businessLines: {
      hasRetail: true,
      hasGrosir: false,
      hasUkmSupply: true,
      hasWaste: true,
      hasWhiteLabel: true,
    },
    warehouseCapacityCbm: 1200,
    isActive: true,
    openedAt: '2026-06-01',
  },
  {
    id: 'OUTLET-BONESELATAN-01',
    code: 'BNS-01',
    name: 'Oriental Cabang Bone Selatan (Kahu)',
    region: 'BONESELATAN',
    address: 'Jl. Poros Sinjai-Watampone KM 45, Kahu, Kab. Bone',
    phone: '085299441122',
    managerName: 'Syamsul Bahri',
    isHeadquarters: false,
    businessLines: {
      hasRetail: true,
      hasGrosir: true,
      hasUkmSupply: false,
      hasWaste: true,
      hasWhiteLabel: false,
    },
    warehouseCapacityCbm: 800,
    isActive: true,
    openedAt: '2026-08-10',
  },
];

export const INITIAL_STOCK_TRANSFERS: InterStoreTransferRecord[] = [
  {
    id: 'trf-001',
    transferNumber: 'TRF-202609-001',
    sourceOutletId: 'OUTLET-WATAMPONE-01',
    sourceOutletName: 'Oriental Pusat Watampone',
    targetOutletId: 'OUTLET-MAKASSAR-01',
    targetOutletName: 'Oriental Cabang Makassar',
    status: 'RECEIVED',
    items: [
      {
        productId: 'prod-minyak',
        productName: 'Minyak Goreng Oriental 2L',
        variantUnitName: 'Karton',
        quantity: 15,
        multiplierToBaseUnit: 6,
        baseUnitsTotal: 90,
      },
    ],
    totalBaseUnits: 90,
    driverName: 'Daeng Baso',
    vehiclePlate: 'DD 8192 AY',
    notes: 'Pasokan awal buffer stock cabang Makassar',
    dispatchedAt: '2026-09-20T08:30:00Z',
    receivedAt: '2026-09-21T14:15:00Z',
    dispatchedBy: 'Joko Prayitno (Gudang)',
    receivedBy: 'Farhan Maulana (Kepala Toko)',
    createdAt: '2026-09-20T08:00:00Z',
  },
  {
    id: 'trf-002',
    transferNumber: 'TRF-202609-002',
    sourceOutletId: 'OUTLET-WATAMPONE-01',
    sourceOutletName: 'Oriental Pusat Watampone',
    targetOutletId: 'OUTLET-BONESELATAN-01',
    targetOutletName: 'Oriental Cabang Bone Selatan (Kahu)',
    status: 'IN_TRANSIT',
    items: [
      {
        productId: 'prod-beras',
        productName: 'Beras Premium Ramos 25Kg',
        variantUnitName: 'Sak',
        quantity: 20,
        multiplierToBaseUnit: 1,
        baseUnitsTotal: 20,
      },
      {
        productId: 'prod-gula',
        productName: 'Gula Pasir Kristal Putih 50Kg',
        variantUnitName: 'Sak',
        quantity: 10,
        multiplierToBaseUnit: 1,
        baseUnitsTotal: 10,
      },
    ],
    totalBaseUnits: 30,
    driverName: 'Syamsir (Ekspedisi Lintas Bone)',
    vehiclePlate: 'DW 8421 AH',
    notes: 'Kebutuhan grosir sembako pasar Kahu akhir pekan',
    dispatchedAt: '2026-09-26T06:45:00Z',
    dispatchedBy: 'Joko Prayitno (Gudang)',
    createdAt: '2026-09-25T16:00:00Z',
  },
];

export const INITIAL_PRICE_PROPOSALS: BranchPriceProposal[] = [
  {
    id: 'prp-001',
    proposalNumber: 'PRP-202609-001',
    outletId: 'OUTLET-MAKASSAR-01',
    outletName: 'Oriental Cabang Makassar',
    productId: 'prod-minyak',
    productName: 'Minyak Goreng Oriental 2L',
    currentPrice: 34000,
    proposedPrice: 32500,
    proposalType: 'PRICE_DROP',
    reason: 'Persaingan ketat pasar lokal Pettarani - Grosir Surya menjual minyak 2L seharga Rp 32.500',
    competitorName: 'Grosir Surya Pettarani',
    competitorPrice: 32500,
    proofAttachments: [
      { id: 'att-1', name: 'Foto 1 - Price Tag Rak Kompetitor.jpg', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300', uploadedAt: '2026-09-24' },
      { id: 'att-2', name: 'Foto 2 - Brosur Promo Surya Pettarani.jpg', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300', uploadedAt: '2026-09-24' },
      { id: 'att-3', name: 'Foto 3 - Struk Belanja Kasir Surya.jpg', url: 'https://images.unsplash.com/photo-1554415707-9e496667b2d2?w=300', uploadedAt: '2026-09-24' },
      { id: 'att-4', name: 'Foto 4 - Display Depan Toko Kompetitor.jpg', url: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=300', uploadedAt: '2026-09-24' },
    ],
    submittedBy: 'Farhan Maulana (Kepala Toko)',
    submittedAt: '2026-09-24T10:15:00Z',
    regionalReviewerId: 'usr-reg-01',
    regionalReviewNotes: 'Rekomendasi disetujui: Margin kotor masih di 7.8% (COGS 30.000). Sangat layak untuk memenangkan pasar Pettarani.',
    regionalReviewedAt: '2026-09-25T09:30:00Z',
    status: 'REVIEWED_BY_REGIONAL',
  },
  {
    id: 'prp-002',
    proposalNumber: 'PRP-202609-002',
    outletId: 'OUTLET-BONESELATAN-01',
    outletName: 'Oriental Cabang Bone Selatan (Kahu)',
    productId: 'prod-gula',
    productName: 'Gula Pasir Kristal Putih 50Kg',
    currentPrice: 775000,
    proposedPrice: 755000,
    proposalType: 'LOCAL_PROMO',
    reason: 'Promo pembukaan toko dan pasar murah menyambut Maulid Nabi di Kahu',
    competitorName: 'UD Sumber Rezeki Kahu',
    competitorPrice: 760000,
    proofAttachments: [
      { id: 'att-5', name: 'Foto 1 - Spanduk Promo Pesaing Kahu.jpg', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300', uploadedAt: '2026-09-22' },
      { id: 'att-6', name: 'Foto 2 - Price Card Pasar Kahu.jpg', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300', uploadedAt: '2026-09-22' },
      { id: 'att-7', name: 'Foto 3 - Kwitansi Pembelian Petani.jpg', url: 'https://images.unsplash.com/photo-1554415707-9e496667b2d2?w=300', uploadedAt: '2026-09-22' },
      { id: 'att-8', name: 'Foto 4 - Dokumentasi Gudang Cabang.jpg', url: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=300', uploadedAt: '2026-09-22' },
    ],
    submittedBy: 'Syamsul Bahri (Kepala Toko)',
    submittedAt: '2026-09-22T11:00:00Z',
    regionalReviewerId: 'usr-reg-01',
    regionalReviewNotes: 'Disetujui untuk promo terbatas 7 hari periode Maulid.',
    regionalReviewedAt: '2026-09-23T08:00:00Z',
    ownerReviewerId: 'usr-001',
    ownerReviewNotes: 'Final approval oleh Owner Chandra. Evaluasi omset setelah 7 hari.',
    ownerReviewedAt: '2026-09-23T14:00:00Z',
    status: 'APPROVED_BY_OWNER',
  },
];

// ==========================================
// Sprint 9 Mock Initial Datasets (PRD Addendum §9 & §10)
// ==========================================

export const INITIAL_PRODUCT_SEGMENT_PRICES: ProductSegmentPrice[] = [
  // Minyak Goreng Oriental 2L
  {
    id: 'psp-myk-01',
    productId: 'prod-minyak',
    productName: 'Minyak Goreng Oriental 2L',
    segment: PricingSegmentType.RETAIL_B2C,
    segmentLabel: 'Retail / End-Customer',
    minOrderQty: 1,
    unit: 'Pouch',
    baseHpp: 28000,
    markupPct: 21.4,
    sellingPrice: 34000,
    effectiveDate: '2026-09-01',
    notes: 'Harga eceran resmi Swalayan Oriental',
    isActive: true,
  },
  {
    id: 'psp-myk-02',
    productId: 'prod-minyak',
    productName: 'Minyak Goreng Oriental 2L',
    segment: PricingSegmentType.UKM_KULINER,
    segmentLabel: 'UKM Kuliner / Warung / Cafe',
    minOrderQty: 2,
    unit: 'Karton (6 Pouch)',
    baseHpp: 168000,
    markupPct: 14.3,
    sellingPrice: 192000,
    effectiveDate: '2026-09-01',
    notes: 'Paket langganan bahan baku UKM Horeka',
    isActive: true,
  },
  {
    id: 'psp-myk-03',
    productId: 'prod-minyak',
    productName: 'Minyak Goreng Oriental 2L',
    segment: PricingSegmentType.GROSIR_AGEN,
    segmentLabel: 'Grosir & Toko Kelontong',
    minOrderQty: 10,
    unit: 'Karton (6 Pouch)',
    baseHpp: 168000,
    markupPct: 13.1,
    sellingPrice: 190000,
    effectiveDate: '2026-09-01',
    notes: 'Harga partai grosir min. 10 karton',
    isActive: true,
  },
  {
    id: 'psp-myk-04',
    productId: 'prod-minyak',
    productName: 'Minyak Goreng Oriental 2L',
    segment: PricingSegmentType.HOREKA,
    segmentLabel: 'Hotel & Catering Bintang',
    minOrderQty: 20,
    unit: 'Karton (6 Pouch)',
    baseHpp: 168000,
    markupPct: 11.9,
    sellingPrice: 188000,
    effectiveDate: '2026-09-01',
    notes: 'Kontrak korporasi & invoice termin 30 hari',
    isActive: true,
  },
  {
    id: 'psp-myk-05',
    productId: 'prod-minyak',
    productName: 'Minyak Goreng Oriental 2L',
    segment: PricingSegmentType.DISTRIBUTOR,
    segmentLabel: 'Distributor / Sub-Dipo Daerah',
    minOrderQty: 60,
    unit: 'Palet (60 Karton)',
    baseHpp: 10080000,
    markupPct: 9.5,
    sellingPrice: 11040000,
    effectiveDate: '2026-09-01',
    notes: 'Harga partai truk palet FOT gudang',
    isActive: true,
  },
  // Beras Premium Pulen 5Kg
  {
    id: 'psp-brs-01',
    productId: 'prod-beras',
    productName: 'Beras Premium Pulen 5Kg',
    segment: PricingSegmentType.RETAIL_B2C,
    segmentLabel: 'Retail / End-Customer',
    minOrderQty: 1,
    unit: 'Karung 5Kg',
    baseHpp: 62000,
    markupPct: 19.3,
    sellingPrice: 74000,
    effectiveDate: '2026-09-01',
    notes: 'Harga eceran beras premium pulen',
    isActive: true,
  },
  {
    id: 'psp-brs-02',
    productId: 'prod-beras',
    productName: 'Beras Premium Pulen 5Kg',
    segment: PricingSegmentType.UKM_KULINER,
    segmentLabel: 'UKM Kuliner / Warung / Cafe',
    minOrderQty: 2,
    unit: 'Bal (5 Karung)',
    baseHpp: 310000,
    markupPct: 12.9,
    sellingPrice: 350000,
    effectiveDate: '2026-09-01',
    notes: 'Harga khusus pasokan rutin RM/Resto',
    isActive: true,
  },
  {
    id: 'psp-brs-03',
    productId: 'prod-beras',
    productName: 'Beras Premium Pulen 5Kg',
    segment: PricingSegmentType.GROSIR_AGEN,
    segmentLabel: 'Grosir & Toko Kelontong',
    minOrderQty: 5,
    unit: 'Bal (5 Karung)',
    baseHpp: 310000,
    markupPct: 12.2,
    sellingPrice: 348000,
    effectiveDate: '2026-09-01',
    notes: 'Tier grosir bal sembako',
    isActive: true,
  },
  // Gula Pasir Kristal 50Kg
  {
    id: 'psp-gla-01',
    productId: 'prod-gula',
    productName: 'Gula Pasir Kristal Putih 50Kg',
    segment: PricingSegmentType.GROSIR_AGEN,
    segmentLabel: 'Grosir & Toko Kelontong',
    minOrderQty: 1,
    unit: 'Sak 50Kg',
    baseHpp: 660000,
    markupPct: 10.6,
    sellingPrice: 730000,
    effectiveDate: '2026-09-01',
    notes: 'Harga partai grosir sak karung',
    isActive: true,
  },
  {
    id: 'psp-gla-02',
    productId: 'prod-gula',
    productName: 'Gula Pasir Kristal Putih 50Kg',
    segment: PricingSegmentType.UKM_KULINER,
    segmentLabel: 'UKM Kuliner & Bakery',
    minOrderQty: 1,
    unit: 'Sak 50Kg',
    baseHpp: 660000,
    markupPct: 9.8,
    sellingPrice: 725000,
    effectiveDate: '2026-09-01',
    notes: 'Diskon khusus bahan baku bakery & coffeeshop',
    isActive: true,
  },
];

export const INITIAL_DAILY_SALES_REPORT: DailySalesReportData = {
  date: '2026-09-26',
  outletId: 'OUTLET-WATAMPONE-01',
  outletName: 'Oriental Pusat Watampone',
  grossRevenue: 48500000,
  totalDiscount: 1250000,
  netRevenue: 47250000,
  transactionCount: 84,
  averageBasketValue: 562500,
  totalItemsSold: 342,
  transactions: [
    {
      id: 'tx-001',
      time: '14:45',
      invoiceNumber: 'INV-RET-892101',
      cashierName: 'Siti Rahma',
      channel: 'Retail Swalayan',
      itemCount: 4,
      grandTotal: 185000,
      paymentMethod: 'ORIENTAL_PAY',
      customerName: 'Bpk. Hendra Gunawan',
    },
    {
      id: 'tx-002',
      time: '14:20',
      invoiceNumber: 'INV-GRO-892095',
      cashierName: 'Budi Wijaya',
      channel: 'Grosir B2B',
      itemCount: 25,
      grandTotal: 14800000,
      paymentMethod: 'TERMS_OF_PAYMENT',
      customerName: 'RM Maliku Fried Chicken',
    },
    {
      id: 'tx-003',
      time: '13:50',
      invoiceNumber: 'INV-RET-892080',
      cashierName: 'Siti Rahma',
      channel: 'Retail Swalayan',
      itemCount: 2,
      grandTotal: 125000,
      paymentMethod: 'QRIS_DYNAMIC',
      customerName: 'Andi Mappaselling',
    },
    {
      id: 'tx-004',
      time: '13:10',
      invoiceNumber: 'INV-UKM-892066',
      cashierName: 'Budi Wijaya',
      channel: 'UKM Supply Chain',
      itemCount: 8,
      grandTotal: 3450000,
      paymentMethod: 'CASH',
      customerName: 'Coto Makassar Nusantara',
    },
    {
      id: 'tx-005',
      time: '12:30',
      invoiceNumber: 'INV-RET-892051',
      cashierName: 'Siti Rahma',
      channel: 'Retail Swalayan',
      itemCount: 5,
      grandTotal: 240000,
      paymentMethod: 'DEBIT_CREDIT',
      customerName: 'Pelanggan Umum',
    },
    {
      id: 'tx-006',
      time: '11:45',
      invoiceNumber: 'INV-WST-892039',
      cashierName: 'Ahmad Operator',
      channel: 'Waste Purchasing (UCO)',
      itemCount: 1,
      grandTotal: 250000,
      paymentMethod: 'ORIENTAL_PAY',
      customerName: 'RM Maliku Fried Chicken',
    },
    {
      id: 'tx-007',
      time: '11:00',
      invoiceNumber: 'INV-WHT-892022',
      cashierName: 'Budi Wijaya',
      channel: 'White Label Maklon',
      itemCount: 12,
      grandTotal: 6800000,
      paymentMethod: 'BANK_TRANSFER',
      customerName: 'Grand Clarion Hotel',
    },
    {
      id: 'tx-008',
      time: '10:15',
      invoiceNumber: 'INV-RET-892010',
      cashierName: 'Siti Rahma',
      channel: 'Retail Swalayan',
      itemCount: 3,
      grandTotal: 175000,
      paymentMethod: 'CASH',
      customerName: 'Pelanggan Umum',
    },
  ],
};

export const INITIAL_CASHIER_SHIFT_REPORTS: CashierShiftReportData[] = [
  {
    id: 'sft-001',
    shiftName: 'Shift 1 (Pagi: 07:00 - 15:00)',
    cashierId: 'usr-003',
    cashierName: 'Siti Rahma',
    outletName: 'Oriental Pusat Watampone',
    openedAt: '2026-09-26 07:00',
    closedAt: '2026-09-26 15:00',
    openingCash: 1000000,
    cashSalesTotal: 14850000,
    nonCashSalesTotal: 18200000,
    pettyCashExpenses: 150000,
    expectedCashInDrawer: 15700000,
    actualCashCounted: 15700000,
    difference: 0,
    status: 'BALANCED',
    notes: 'Shift pagi lancar, petty cash Rp 150.000 untuk pembelian solasi & kantong kresek darurat.',
  },
  {
    id: 'sft-002',
    shiftName: 'Shift 2 (Sore: 15:00 - 22:00)',
    cashierId: 'usr-005',
    cashierName: 'Anita Lestari',
    outletName: 'Oriental Pusat Watampone',
    openedAt: '2026-09-25 15:00',
    closedAt: '2026-09-25 22:00',
    openingCash: 1000000,
    cashSalesTotal: 11200000,
    nonCashSalesTotal: 15400000,
    pettyCashExpenses: 200000,
    expectedCashInDrawer: 12000000,
    actualCashCounted: 12000000,
    difference: 0,
    status: 'BALANCED',
    notes: 'Shift malam closing tepat waktu, kas laci klop dengan Z-Report.',
  },
];

export const INITIAL_PAYMENT_METHOD_BREAKDOWN: PaymentMethodBreakdownData[] = [
  {
    method: 'CASH',
    label: 'Tunai / Cash',
    transactionCount: 42,
    totalVolume: 26050000,
    sharePercentage: 34.2,
    badgeColor: 'emerald',
  },
  {
    method: 'QRIS_DYNAMIC',
    label: 'QRIS Dinamis',
    transactionCount: 28,
    totalVolume: 18400000,
    sharePercentage: 24.1,
    badgeColor: 'sky',
  },
  {
    method: 'DEBIT_CREDIT',
    label: 'Kartu Debit / EDC',
    transactionCount: 16,
    totalVolume: 12800000,
    sharePercentage: 16.8,
    badgeColor: 'indigo',
  },
  {
    method: 'ORIENTAL_PAY',
    label: 'Oriental Pay (Closed-Loop)',
    transactionCount: 12,
    totalVolume: 6250000,
    sharePercentage: 8.2,
    badgeColor: 'amber',
  },
  {
    method: 'TERMS_OF_PAYMENT',
    label: 'Piutang TOP B2B',
    transactionCount: 6,
    totalVolume: 9800000,
    sharePercentage: 12.9,
    badgeColor: 'rose',
  },
  {
    method: 'BANK_TRANSFER',
    label: 'Transfer Bank Langsung',
    transactionCount: 4,
    totalVolume: 2900000,
    sharePercentage: 3.8,
    badgeColor: 'purple',
  },
];

export const INITIAL_OUTLET_SUMMARIES: OutletSummaryReportData[] = [
  {
    outletId: 'OUTLET-WATAMPONE-01',
    outletCode: 'WTP-01',
    outletName: 'Oriental Pusat Watampone',
    region: 'Watampone, Bone',
    revenue: 48500000,
    grossProfit: 12125000,
    transactionsCount: 84,
    activeBusinessLinesCount: 5,
    targetRevenue: 45000000,
    achievementPct: 107.8,
    shareOfTotalRevenuePct: 58.4,
  },
  {
    outletId: 'OUTLET-MAKASSAR-01',
    outletCode: 'MKS-01',
    outletName: 'Oriental Cabang Makassar',
    region: 'Panakkukang, Makassar',
    revenue: 24200000,
    grossProfit: 6050000,
    transactionsCount: 45,
    activeBusinessLinesCount: 4,
    targetRevenue: 25000000,
    achievementPct: 96.8,
    shareOfTotalRevenuePct: 29.2,
  },
  {
    outletId: 'OUTLET-BONESELATAN-01',
    outletCode: 'BNS-01',
    outletName: 'Oriental Cabang Bone Selatan (Kahu)',
    region: 'Kahu, Bone Selatan',
    revenue: 10350000,
    grossProfit: 2587500,
    transactionsCount: 22,
    activeBusinessLinesCount: 3,
    targetRevenue: 10000000,
    achievementPct: 103.5,
    shareOfTotalRevenuePct: 12.4,
  },
];

export const INITIAL_FAST_MOVING_PRODUCTS: FastMovingProductData[] = [
  {
    productId: 'prod-minyak',
    productName: 'Minyak Goreng Oriental 2L',
    category: 'Sembako',
    unitsSold: 142,
    unitName: 'Karton',
    totalRevenue: 27690000,
    turnoverRatio: 9.8,
    velocityGrade: 'FAST_MOVING',
    stockRemaining: 120,
  },
  {
    productId: 'prod-beras',
    productName: 'Beras Premium Pulen 5Kg',
    category: 'Sembako',
    unitsSold: 88,
    unitName: 'Karung',
    totalRevenue: 6512000,
    turnoverRatio: 7.2,
    velocityGrade: 'FAST_MOVING',
    stockRemaining: 60,
  },
  {
    productId: 'prod-indomie-kuah',
    productName: 'Indomie Kuah Kari Ayam',
    category: 'Groceries',
    unitsSold: 65,
    unitName: 'Dos',
    totalRevenue: 5200000,
    turnoverRatio: 6.5,
    velocityGrade: 'FAST_MOVING',
    stockRemaining: 180,
  },
  {
    productId: 'prod-gula',
    productName: 'Gula Pasir Kristal Putih 50Kg',
    category: 'Sembako',
    unitsSold: 24,
    unitName: 'Sak',
    totalRevenue: 17520000,
    turnoverRatio: 4.8,
    velocityGrade: 'NORMAL',
    stockRemaining: 35,
  },
  {
    productId: 'prod-sambal-oriental',
    productName: 'Saus Sambal Ekstra Pedas Oriental 1L',
    category: 'Bumbu & Saus',
    unitsSold: 18,
    unitName: 'Jerigen',
    totalRevenue: 684000,
    turnoverRatio: 1.8,
    velocityGrade: 'SLOW_MOVING',
    stockRemaining: 74,
  },
];

export const INITIAL_PERIOD_REVENUE: PeriodRevenueData[] = [
  {
    periodLabel: 'Senin, 21 Sep 2026',
    startDate: '2026-09-21',
    endDate: '2026-09-21',
    grossSales: 68500000,
    cogs: 51375000,
    grossMargin: 17125000,
    growthRatePct: 4.2,
  },
  {
    periodLabel: 'Selasa, 22 Sep 2026',
    startDate: '2026-09-22',
    endDate: '2026-09-22',
    grossSales: 72100000,
    cogs: 54075000,
    grossMargin: 18025000,
    growthRatePct: 5.3,
  },
  {
    periodLabel: 'Rabu, 23 Sep 2026',
    startDate: '2026-09-23',
    endDate: '2026-09-23',
    grossSales: 69400000,
    cogs: 52050000,
    grossMargin: 17350000,
    growthRatePct: -3.7,
  },
  {
    periodLabel: 'Kamis, 24 Sep 2026',
    startDate: '2026-09-24',
    endDate: '2026-09-24',
    grossSales: 75800000,
    cogs: 56850000,
    grossMargin: 18950000,
    growthRatePct: 9.2,
  },
  {
    periodLabel: 'Jumat, 25 Sep 2026',
    startDate: '2026-09-25',
    endDate: '2026-09-25',
    grossSales: 88400000,
    cogs: 66300000,
    grossMargin: 22100000,
    growthRatePct: 16.6,
  },
  {
    periodLabel: 'Sabtu, 26 Sep 2026 (Hari Ini)',
    startDate: '2026-09-26',
    endDate: '2026-09-26',
    grossSales: 83050000,
    cogs: 62287500,
    grossMargin: 20762500,
    growthRatePct: 8.5,
  },
];

export const INITIAL_VOID_RECORDS: VoidAuditRecord[] = [
  {
    id: 'void-001',
    invoiceNumber: 'INV-RET-891902',
    originalAmount: 340000,
    voidReason: 'Pelanggan salah mengambil varian Minyak Goreng (ingin kemasan bantal, terambil pouch)',
    voidedAt: '2026-09-26 10:14',
    cashierName: 'Siti Rahma',
    approvedByManager: 'Budi Wijaya (Admin Manager)',
    restockedItems: [
      { name: 'Minyak Goreng Oriental 2L Pouch', qty: 10, unit: 'Pouch' },
    ],
    notes: 'Barang telah diperiksa utuh dan dikembalikan ke rak display depan.',
  },
  {
    id: 'void-002',
    invoiceNumber: 'INV-GRO-891450',
    originalAmount: 1850000,
    voidReason: 'Input quantity dobel oleh kasir (terinput 20 karton seharusnya 10 karton)',
    voidedAt: '2026-09-25 16:30',
    cashierName: 'Anita Lestari',
    approvedByManager: 'Chandra Santoso (Owner)',
    restockedItems: [
      { name: 'Indomie Goreng Spesial', qty: 10, unit: 'Dos' },
    ],
    notes: 'Nota dibatalkan penuh dan diterbitkan nota revisi baru INV-GRO-891451.',
  },
];

const EcosystemContext = createContext<EcosystemContextType | null>(null);

export const EcosystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // 1. Members Directory & Active Member
  const [membersList, setMembersList] = useState<MemberOneIdentity[]>(INITIAL_MEMBERS);
  const [activeMember, setActiveMember] = useState<MemberOneIdentity>(INITIAL_MEMBERS[0]);

  // 2. RBAC System Users & Current User
  const [systemUsers, setSystemUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [currentUser, setCurrentUserState] = useState<UserProfile>(INITIAL_USERS[0]);

  // Synchronized user setter that triggers JWT authentication
  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
    authApi.login(user.email, user.role);
  };

  // Initial Sync from Backend API with Graceful Offline Fallback
  useEffect(() => {
    // 1. Sync users
    authApi.getUsers().then((remoteUsers) => {
      if (remoteUsers && remoteUsers.length > 0) {
        setSystemUsers(remoteUsers);
      }
    });

    // 2. Sync members
    membersApi.getAll().then((remoteMembers) => {
      if (remoteMembers && remoteMembers.length > 0) {
        setMembersList(remoteMembers);
      }
    });

    // 3. Authenticate current user and acquire JWT
    authApi.login(currentUser.email, currentUser.role);
  }, []);

  // 3. Multi-Unit Inventory State
  const [products, setProducts] = useState<ProductWithMultiUnit[]>(INITIAL_PRODUCTS);

  // 4. Persistent Retail Cart (Does NOT reset on tab change)
  const [retailCart, setRetailCart] = useState<RetailCartItem[]>([]);

  // 5. Live SAK Financial Ledger State (Per-Pilar Ekosistem & Konsolidasian)
  const [financials, setFinancials] = useState<FinancialLedgerState>({
    retailRevenue: 850000000,
    grosirRevenue: 1650000000,
    ukmSupplyRevenue: 720000000,
    whiteLabelRevenue: 400000000,
    wastePurchasesTotal: 25000000,
    wasteFactoryValueTotal: 33000000,
    wasteShareExpense: 800000, // 10% dari margin kotor
    cogsCost: 2650000000,
    cashAndBank: 420000000,
    accountsReceivable: 310000000,
    inventoryValue: 680000000,
    wasteInventoryValue: 25000000,
    wastePayable: 800000, // Utang bagi hasil mitra tempat
    totalTransactionsCount: 1420,
    pillars: {
      RETAIL: {
        revenue: 850000000,
        cogs: 637500000,
        grossProfit: 212500000,
        operatingExpenses: 95000000,
        netProfit: 117500000,
        cashAndBank: 180000000,
        accountsReceivable: 0,
        inventory: 250000000,
        liabilities: 120000000,
      },
      GROSIR: {
        revenue: 1650000000,
        cogs: 1320000000,
        grossProfit: 330000000,
        operatingExpenses: 140000000,
        netProfit: 190000000,
        cashAndBank: 150000000,
        accountsReceivable: 230000000,
        inventory: 310000000,
        liabilities: 240000000,
      },
      UKM_SUPPLY: {
        revenue: 720000000,
        cogs: 576000000,
        grossProfit: 144000000,
        operatingExpenses: 65000000,
        netProfit: 79000000,
        cashAndBank: 60000000,
        accountsReceivable: 80000000,
        inventory: 95000000,
        liabilities: 110000000,
      },
      WASTE: {
        revenue: 33000000,
        cogs: 25000000,
        grossProfit: 8000000,
        operatingExpenses: 800000, // 10% bagi hasil mitra
        netProfit: 7200000,
        cashAndBank: 18000000,
        accountsReceivable: 0,
        inventory: 25000000,
        liabilities: 800000,
      },
      WHITE_LABEL: {
        revenue: 400000000,
        cogs: 280000000,
        grossProfit: 120000000,
        operatingExpenses: 35000000,
        netProfit: 85000000,
        cashAndBank: 12000000,
        accountsReceivable: 0,
        inventory: 25000000,
        liabilities: 10000000,
      },
    },
  });

  // 6. Waste Purchasing State (Minyak Jelantah focus)
  const [wasteCategories, setWasteCategories] = useState<WasteCategoryRate[]>(INITIAL_WASTE_CATEGORIES);
  const [wastePartners, setWastePartners] = useState<WasteLocationPartner[]>(INITIAL_WASTE_PARTNERS);
  const [wasteHistory, setWasteHistory] = useState<WastePurchaseRecord[]>(INITIAL_WASTE_HISTORY);

  // 7. White Label Maklon State
  const [whiteLabelVendors, setWhiteLabelVendors] = useState<WhiteLabelVendor[]>(INITIAL_WHITE_LABEL_VENDORS);
  const [whiteLabelContracts, setWhiteLabelContracts] = useState<WhiteLabelContract[]>(INITIAL_WHITE_LABEL_CONTRACTS);
  const [whiteLabelCatalog, setWhiteLabelCatalog] = useState<WhiteLabelProductItem[]>(INITIAL_WHITE_LABEL_CATALOG);
  const [whiteLabelReceipts, setWhiteLabelReceipts] = useState<WhiteLabelBatchReceipt[]>(INITIAL_WHITE_LABEL_RECEIPTS);
  const [whiteLabelOrders, setWhiteLabelOrders] = useState<WhiteLabelB2BOrder[]>(INITIAL_WHITE_LABEL_ORDERS);

  // 8. Sprint 5: Standing Orders & Referral Engine State
  const [standingOrders, setStandingOrders] = useState<StandingOrder[]>(INITIAL_STANDING_ORDERS);
  const [commissions, setCommissions] = useState<ReferralCommission[]>(INITIAL_COMMISSIONS);
  const [withdrawals, setWithdrawals] = useState<CommissionWithdrawalRequest[]>(INITIAL_WITHDRAWALS);

  // 9. Sprint 6: Oriental Learn & Workshops State
  const [courses, setCourses] = useState<CourseModule[]>(INITIAL_COURSES);
  const [workshops, setWorkshops] = useState<OfflineWorkshop[]>(INITIAL_WORKSHOPS);
  const [certificates, setCertificates] = useState<DigitalCertificate[]>(INITIAL_CERTIFICATES);

  // 10. Sprint 7: Loyalty Tiers, Closed-Loop Oriental Pay & Waste Claims State
  const [wasteSettlementClaims, setWasteSettlementClaims] = useState<WastePartnerSettlementClaim[]>(INITIAL_SETTLEMENT_CLAIMS);
  const [influencerLinks, setInfluencerLinks] = useState<InfluencerProductLink[]>(INITIAL_INFLUENCER_LINKS);

  // Sprint 7: PWA Offline-First & Dexie Sync State
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);
  const [pendingOfflineTransactions, setPendingOfflineTransactions] = useState<OfflineTransaction[]>([]);
  const [recentSyncLogs, setRecentSyncLogs] = useState<SyncLogEntry[]>([]);

  const isEffectiveOnline = isNetworkOnline && !isOfflineSimulated;

  const refreshPendingSync = async () => {
    try {
      const count = await localDb.getPendingCount();
      const txs = await localDb.getPendingTransactions();
      const logs = await localDb.getRecentSyncLogs(5);
      setPendingOfflineCount(count);
      setPendingOfflineTransactions(txs);
      setRecentSyncLogs(logs);
    } catch (err) {
      console.warn('[refreshPendingSync] Error reading localDb:', err);
    }
  };

  const triggerSyncOfflineBatch = async () => {
    try {
      const pendingTxs = await localDb.getPendingTransactions();
      if (pendingTxs.length === 0) {
        return {
          success: true,
          syncedCount: 0,
          duplicatesSkipped: 0,
          message: 'Semua transaksi sudah tersinkronisasi sempurna.',
        };
      }

      // Send batch to Backend API
      const res = await posApi.syncOfflineBatch(pendingTxs);
      const syncedInvoices: string[] = [];
      let syncedCount = 0;
      let duplicatesSkipped = 0;

      if (res && res.success) {
        syncedCount = res.syncedCount;
        duplicatesSkipped = res.duplicatesSkipped;
        for (const item of res.results) {
          syncedInvoices.push(item.invoiceNumber);
        }
      } else {
        for (const tx of pendingTxs) {
          syncedInvoices.push(tx.invoiceNumber);
          syncedCount++;
        }
      }

      // Mark in Dexie
      await localDb.markAsSynced(syncedInvoices);

      // Log sync entry
      await localDb.addSyncLog({
        timestamp: new Date(),
        totalSynced: syncedCount,
        duplicatesSkipped,
        invoices: syncedInvoices,
        status: 'SUCCESS',
        notes: `Batch sinkronisasi ${syncedCount} transaksi kasir via Dexie.js PWA Service Worker`,
      });

      await refreshPendingSync();

      return {
        success: true,
        syncedCount,
        duplicatesSkipped,
        message: `${syncedCount} transaksi offline berhasil disinkronkan ke server pusat tanpa duplikasi!`,
      };
    } catch (err: any) {
      console.error('[triggerSyncOfflineBatch] Sync error:', err);
      return {
        success: false,
        syncedCount: 0,
        duplicatesSkipped: 0,
        message: `Gagal sinkronisasi: ${err?.message || 'Koneksi terputus'}`,
      };
    }
  };

  useEffect(() => {
    refreshPendingSync();

    const handleOnline = () => {
      setIsNetworkOnline(true);
      if (!isOfflineSimulated) {
        triggerSyncOfflineBatch();
      }
    };
    const handleOffline = () => {
      setIsNetworkOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOfflineSimulated]);

  // 11. Sprint 8: Multi-Outlet, Stock Transfers & Branch Price Proposals
  const [outletsList, setOutletsList] = useState<OutletLocation[]>(INITIAL_OUTLETS);
  const [activeOutletId, setActiveOutletId] = useState<string>('OUTLET-WATAMPONE-01');
  const [stockTransfers, setStockTransfers] = useState<InterStoreTransferRecord[]>(INITIAL_STOCK_TRANSFERS);
  const [branchPriceProposals, setBranchPriceProposals] = useState<BranchPriceProposal[]>(INITIAL_PRICE_PROPOSALS);

  // 12. Sprint 9: Flexible Price Lists & 7 Operational Reports State (PRD Addendum §9 & §10)
  const [productSegmentPrices, setProductSegmentPrices] = useState<ProductSegmentPrice[]>(INITIAL_PRODUCT_SEGMENT_PRICES);
  const [dailySalesReport, setDailySalesReport] = useState<DailySalesReportData>(INITIAL_DAILY_SALES_REPORT);
  const [cashierShiftReports, setCashierShiftReports] = useState<CashierShiftReportData[]>(INITIAL_CASHIER_SHIFT_REPORTS);
  const [paymentMethodBreakdown, setPaymentMethodBreakdown] = useState<PaymentMethodBreakdownData[]>(INITIAL_PAYMENT_METHOD_BREAKDOWN);
  const [outletSummaries, setOutletSummaries] = useState<OutletSummaryReportData[]>(INITIAL_OUTLET_SUMMARIES);
  const [fastMovingProducts, setFastMovingProducts] = useState<FastMovingProductData[]>(INITIAL_FAST_MOVING_PRODUCTS);
  const [periodRevenueReports, setPeriodRevenueReports] = useState<PeriodRevenueData[]>(INITIAL_PERIOD_REVENUE);
  const [voidAuditRecords, setVoidAuditRecords] = useState<VoidAuditRecord[]>(INITIAL_VOID_RECORDS);

  const activeOutlet = outletsList.find((o) => o.id === activeOutletId) || outletsList[0];

  const toggleOutletBusinessLine = (outletId: string, lineKey: keyof OutletBusinessLineMatrix) => {
    setOutletsList((prev) =>
      prev.map((o) =>
        o.id === outletId
          ? {
              ...o,
              businessLines: {
                ...o.businessLines,
                [lineKey]: !o.businessLines[lineKey],
              },
            }
          : o,
      ),
    );
  };


  // 6. Tracker Penomoran Kupon Undian Resmi (Master format Penomoran Kupon Undian.md)
  // Format: ORT-KUPYYMM-urutan(4 DIGIT). Maksimal 2500 per bulan, jika lebih maju ke bulan depan.
  const [couponTracker, setCouponTracker] = useState<{ yymm: string; currentSeq: number }>(() => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return { yymm: `${yy}${mm}`, currentSeq: 52 };
  });

  const issueDoorprizeCoupons = (count: number): string[] => {
    if (count <= 0) return [];
    const generated: string[] = [];
    let { yymm, currentSeq } = couponTracker;

    for (let i = 0; i < count; i++) {
      currentSeq += 1;
      if (currentSeq > LOYALTY_POINT_RULES.DOORPRIZE_MONTHLY_LIMIT) {
        // Roll over ke bulan berikutnya jika kuota 2500 lembar/bulan tercapai
        const year = parseInt(`20${yymm.slice(0, 2)}`, 10);
        const month = parseInt(yymm.slice(2, 4), 10); // 1-12
        const nextDate = new Date(year, month, 1);
        const nextYY = String(nextDate.getFullYear()).slice(-2);
        const nextMM = String(nextDate.getMonth() + 1).padStart(2, '0');
        yymm = `${nextYY}${nextMM}`;
        currentSeq = 1;
      }
      const seqStr = String(currentSeq).padStart(4, '0');
      generated.push(`ORT-KUP${yymm}-${seqStr}`);
    }

    setCouponTracker({ yymm, currentSeq });
    return generated;
  };

  // Switch Active Member
  const selectActiveMember = (codeOrId: string) => {
    const found = membersList.find(
      (m) => m.id === codeOrId || m.memberCode === codeOrId || m.barcode === codeOrId,
    );
    if (found) {
      setActiveMember(found);
    }
  };

  // Register New Member adhering strictly to Template Form Costumer One Identity.xlsx
  const registerNewMember = (dto: RegisterMemberDto): MemberOneIdentity => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yymmdd = `${yy}${mm}${dd}`;

    const regionPrefix = dto.regionCode || RegionCode.WATAMPONE;
    const sameRegionMembers = membersList.filter((m) => m.regionCode === regionPrefix);
    const seqNumber = String(sameRegionMembers.length + 1).padStart(2, '0');
    const memberCode = `${regionPrefix}-${yymmdd}-${seqNumber}`;

    // 8-digit unique barcode starting with 82
    const barcodeSeq = String(membersList.length + 80).padStart(6, '0');
    const barcode = `82${barcodeSeq}`;

    // Build Business Profile
    const businessProfiles = dto.businessName
      ? [
          {
            businessIndex: 1,
            businessCode: `${memberCode}-01-100`,
            businessName: dto.businessName,
            businessType: dto.businessType || 'Kuliner / Retail',
            businessLocation: dto.businessLocation || dto.address || 'Makassar / Watampone',
            picName: dto.picName || dto.fullName,
            picRole: dto.picRole || 'Owner',
            picWhatsapp: dto.picWhatsapp || dto.phone,
            socialMedia: dto.socialMedia,
            businessModel: dto.businessModel || 'Single Ownership',
            featuredProducts: dto.featuredProducts || [],
          },
        ]
      : [];

    const newMember: MemberOneIdentity = {
      id: `mem-${Date.now().toString().slice(-4)}`,
      memberCode,
      barcode,
      fullName: dto.fullName,
      nik: dto.nik,
      phone: dto.phone,
      birthDate: dto.birthDate,
      gender: dto.gender,
      email: dto.email,
      address: dto.address,
      regionCode: regionPrefix,
      segment: dto.segment || CustomerSegment.B2C_RETAIL,
      businessName: dto.businessName,
      businessProfiles,
      surveyData: {
        outletCount: dto.outletCount || 1,
        monthlySpendEstimate: dto.monthlySpendEstimate || 'Rp. 15-30 Jt',
        mainRawMaterials: dto.mainRawMaterials || [],
        posUsage: dto.posUsage || 'Pakai',
        managementStructure: (dto.managementStructure as any) || 'Tidak ada, saya mengelola Sendiri',
        businessGoals: dto.businessGoals || [],
      },
      totalLoyaltyPoints: 0,
      totalSpendMonth: 0,
      doorprizeCouponsCount: 0,
      doorprizeCoupons: [],
      pointHistory: [],
      isActive: true,
      registeredAt: now,
    };

    setMembersList((prev) => [newMember, ...prev]);
    setActiveMember(newMember);

    // Sync with REST API
    membersApi.register(dto).then((remoteMember) => {
      if (remoteMember) {
        setMembersList((prev) =>
          prev.map((m) => (m.phone === dto.phone ? remoteMember : m)),
        );
        setActiveMember(remoteMember);
      }
    }).catch((err) => {
      console.warn('[EcosystemContext.registerNewMember] API sync notice:', err);
    });

    return newMember;
  };

  // RBAC: Delegate New Staff User
  const delegateNewUser = (dto: DelegateUserDto): UserProfile => {
    const newUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      role: dto.role,
      tenantId: currentUser.tenantId || 'tenant-oriental-01',
      delegatedById: currentUser.id,
      delegatedByName: `${currentUser.name} (${currentUser.role})`,
      isActive: true,
      createdAt: new Date(),
    };

    setSystemUsers((prev) => [...prev, newUser]);

    // Sync with backend API
    authApi
      .delegateUser(currentUser.role, currentUser.name, currentUser.id, dto)
      .then((res) => {
        if (res && res.user) {
          setSystemUsers((prev) =>
            prev.map((u) => (u.email === dto.email ? res.user : u)),
          );
        }
      })
      .catch((err) => {
        console.warn('[EcosystemContext.delegateNewUser] API delegation notice:', err);
      });

    return newUser;
  };

  // RBAC: Toggle User Status (Active / Suspended)
  const toggleUserStatus = (userId: string) => {
    setSystemUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
    );
    authApi.toggleUserStatus(userId).catch((err) => {
      console.warn('[EcosystemContext.toggleUserStatus] API error:', err);
    });
  };

  // Helper: Format Multi-Unit Stock
  const formatStock = (prod: ProductWithMultiUnit): string => {
    const packs = Math.floor(prod.totalStockInBaseUnits / prod.unitsPerPack);
    const remainder = prod.totalStockInBaseUnits % prod.unitsPerPack;
    return `${packs} ${prod.packUnitName} ${remainder} ${prod.baseUnitName}`;
  };

  // Cart Action: Add Item to Persistent Cart
  const addToRetailCart = (product: ProductWithMultiUnit, variant: ProductUnitVariant) => {
    setRetailCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.unitVariant.unitName === variant.unitName,
      );

      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          unitVariant: variant,
          quantity: 1,
          unitPrice: variant.price,
          subtotal: variant.price,
        },
      ];
    });
  };

  // Cart Action: Update Quantity
  const updateRetailCartQty = (productId: string, unitName: string, delta: number) => {
    setRetailCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId && item.unitVariant.unitName === unitName) {
            const newQty = item.quantity + delta;
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  // Cart Action: Clear Cart
  const clearRetailCart = () => {
    setRetailCart([]);
  };

  // Action: Process Retail Transaction with Automatic Stock Deduction, Member Points & Doorprize Coupons
  const addRetailTransaction = (paidAmount: number, paymentMethod: string, discountTotal: number = 0) => {
    const rawSubtotal = retailCart.reduce((sum, item) => sum + item.subtotal, 0);
    const grandTotal = Math.max(0, rawSubtotal - discountTotal);
    const invoiceNumber = `INV-RET-${Date.now().toString().slice(-6)}`;

    // Snapshot cart items before clearing
    const cartSnapshot = [...retailCart];

    // PRD v2.1 Addendum §2.4: Point diterima oleh costumer end-user/cafe yang membeli produk maklon melalui Oriental Ekosistem Rp 10.000 = 1 point!
    // Regular items: Rp 100.000 = 1 point
    let maklonSpend = 0;
    let regularSpend = 0;
    cartSnapshot.forEach((c) => {
      const prod = products.find((p) => p.id === c.productId);
      if (prod?.isMaklonProduct) {
        maklonSpend += c.subtotal;
      } else {
        regularSpend += c.subtotal;
      }
    });

    const maklonPoints = Math.floor(maklonSpend / 10000);
    const regularPoints = Math.floor(Math.max(0, regularSpend - discountTotal) / LOYALTY_POINT_RULES.RETAIL_SPEND_PER_POINT);
    let pointsEarned = maklonPoints + regularPoints;

    // PRD v2.1 Addendum §4.1: Bonus Point Berdasarkan Tier (Gold +10%, Platinum +15%)
    if (activeMember.currentTier === CustomerTier.PLATINUM) {
      pointsEarned = Math.round(pointsEarned * 1.15);
    } else if (activeMember.currentTier === CustomerTier.GOLD) {
      pointsEarned = Math.round(pointsEarned * 1.10);
    }

    const couponsEarned = Math.floor(grandTotal / LOYALTY_POINT_RULES.DOORPRIZE_SPEND_PER_COUPON);
    const changeAmount = paymentMethod === 'ORIENTAL_PAY' ? 0 : Math.max(0, paidAmount - grandTotal);

    // Validate Oriental Pay balance if chosen
    if (paymentMethod === 'ORIENTAL_PAY') {
      const curBal = activeMember.orientalPayBalance || 0;
      if (curBal < grandTotal) {
        throw new Error(
          `Saldo Oriental Pay tidak mencukupi (Tersedia: Rp ${curBal.toLocaleString('id-ID')}, Dibutuhkan: Rp ${grandTotal.toLocaleString('id-ID')})`
        );
      }
    }

    // 1. Deduct Stock in Base Units
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const cartItemsForThisProd = cartSnapshot.filter((c) => c.productId === prod.id);
        if (cartItemsForThisProd.length === 0) return prod;

        let totalBaseUnitsDeducted = 0;
        cartItemsForThisProd.forEach((item) => {
          totalBaseUnitsDeducted += item.quantity * item.unitVariant.multiplier;
        });

        const newStock = Math.max(0, prod.totalStockInBaseUnits - totalBaseUnitsDeducted);
        return {
          ...prod,
          totalStockInBaseUnits: newStock,
        };
      }),
    );

    // 2. Generate New Doorprize Coupon Numbers (Master: ORT-KUPYYMM-urutan)
    const newCouponCodes = issueDoorprizeCoupons(couponsEarned);

    const historyRecord: PointMutationRecord = {
      id: `mut-${Date.now()}`,
      memberId: activeMember.id,
      date: new Date().toLocaleString('id-ID'),
      invoiceNumber,
      channel: 'RETAIL',
      description: `Belanja Retail ${cartSnapshot
        .map((c) => `${c.productName} (${c.quantity} ${c.unitVariant.unitName})`)
        .join(', ')}`,
      transactionAmount: grandTotal,
      pointsEarned,
      couponsEarned,
    };

    // Update active member and synchronize with membersList
    setActiveMember((prev) => {
      const newOpBalance =
        paymentMethod === 'ORIENTAL_PAY'
          ? Math.max(0, (prev.orientalPayBalance || 0) - grandTotal)
          : (prev.orientalPayBalance || 0);

      const opHistoryEntry: OrientalPayTransactionRecord | null =
        paymentMethod === 'ORIENTAL_PAY'
          ? {
              id: `op-tx-${Date.now().toString().slice(-6)}`,
              memberId: prev.id,
              type: 'PURCHASE_PAYMENT',
              amount: -grandTotal,
              balanceAfter: newOpBalance,
              description: `Pembayaran Belanja Retail (${invoiceNumber})`,
              channel: 'RETAIL',
              referenceId: invoiceNumber,
              createdAt: new Date().toISOString(),
            }
          : null;

      const updated: MemberOneIdentity = {
        ...prev,
        orientalPayBalance: newOpBalance,
        orientalPayHistory: opHistoryEntry
          ? [opHistoryEntry, ...(prev.orientalPayHistory || [])]
          : prev.orientalPayHistory,
        totalLoyaltyPoints: prev.totalLoyaltyPoints + pointsEarned,
        totalSpendMonth: prev.totalSpendMonth + grandTotal,
        doorprizeCouponsCount: prev.doorprizeCouponsCount + couponsEarned,
        doorprizeCoupons: [...newCouponCodes, ...(prev.doorprizeCoupons || [])],
        pointHistory: [historyRecord, ...(prev.pointHistory || [])],
      };

      setMembersList((list) => list.map((m) => (m.id === prev.id ? updated : m)));
      return updated;
    });

    // 3. Update Live Financial Ledger (SAK)
    const estimatedHPP = Math.round(grandTotal * 0.75);
    setFinancials((prev) => ({
      ...prev,
      retailRevenue: prev.retailRevenue + grandTotal,
      cogsCost: prev.cogsCost + estimatedHPP,
      cashAndBank: prev.cashAndBank + grandTotal,
      inventoryValue: Math.max(0, prev.inventoryValue - estimatedHPP),
      totalTransactionsCount: prev.totalTransactionsCount + 1,
    }));

    // 4. Clear Persistent Retail Cart
    setRetailCart([]);

    // 5. Store in Dexie IndexedDB for Offline-First resilience (Sprint 7)
    const isOnlineNow = isEffectiveOnline;
    localDb.offlineTransactions
      .add({
        invoiceNumber,
        channel: 'RETAIL_B2C',
        items: cartSnapshot.map((c) => ({
          productId: c.productId,
          name: c.productName,
          barcode: c.unitVariant.barcode,
          price: c.unitPrice,
          quantity: c.quantity,
          subtotal: c.subtotal,
        })),
        grandTotal,
        paidAmount,
        changeAmount,
        paymentMethod,
        cashierId: currentUser.id,
        memberCode: activeMember.memberCode,
        isSynced: isOnlineNow,
        createdAt: new Date(),
      })
      .then(() => refreshPendingSync())
      .catch((err) => console.warn('[localDb.offlineTransactions] Save error:', err));

    // 6. Notify Backend API if online
    if (isOnlineNow) {
      posApi
        .checkout({
          invoiceNumber,
          transactionType: 'RETAIL_B2C',
          grandTotal,
          paidAmount,
          paymentMethod,
          cashierId: currentUser.id,
          memberCode: activeMember.memberCode,
        })
        .catch((err) => {
          console.warn('[posApi.checkout] API failed, marking as pending sync in Dexie:', err);
          localDb.offlineTransactions.where({ invoiceNumber }).modify({ isSynced: false })
            .then(() => refreshPendingSync());
        });
    }

    return {
      invoiceNumber,
      pointsEarned,
      couponsEarned,
      couponCodes: newCouponCodes,
      items: cartSnapshot,
      grandTotal,
      paidAmount,
      changeAmount,
    };
  };

  // Action: Process B2B / Grosir Transaction with Live Stock Deduction & Dynamic Points (UKM Supply vs Grosir)
  const addB2BTransaction = (
    items: any[],
    grandTotal: number,
    paymentType: 'CASH' | 'TERMIN',
    customerName: string,
    channel: 'GROSIR' | 'UKM_SUPPLY' = 'GROSIR',
    topOptions?: { topDays?: number; dueDate?: string },
  ) => {
    const isUkm = channel === 'UKM_SUPPLY';
    const invoiceNumber = `INV-${isUkm ? 'UKM' : 'GRO'}-${Date.now().toString().slice(-6)}`;

    // PRD v2.1 Addendum §4.1: Platinum Member (Rolling 3 Bulan > 70 Juta) mendapatkan Diskon Tambahan 1% di invoice pasokan bahan baku
    const isPlatinum = activeMember.currentTier === CustomerTier.PLATINUM || (activeMember.rolling3MonthAvgSpend || 0) >= 70000000;
    const tierDiscount = (isUkm && isPlatinum) ? Math.round(grandTotal * 0.01) : 0;
    const finalGrandTotal = Math.max(0, grandTotal - tierDiscount);

    // Konversi Poin Dinamis: UKM Supply (Rp 50.000 = 1 pt) vs Grosir (Rp 200.000 = 1 pt)
    const pointRule = isUkm
      ? LOYALTY_POINT_RULES.UKM_SUPPLY_SPEND_PER_POINT
      : LOYALTY_POINT_RULES.GROSIR_SPEND_PER_POINT;

    let pointsEarned = Math.floor(finalGrandTotal / pointRule);
    // PRD v2.1 Addendum §4.1: Bonus Point Berdasarkan Tier (Gold +10%, Platinum +15%)
    if (activeMember.currentTier === CustomerTier.PLATINUM) {
      pointsEarned = Math.round(pointsEarned * 1.15);
    } else if (activeMember.currentTier === CustomerTier.GOLD) {
      pointsEarned = Math.round(pointsEarned * 1.10);
    }

    const couponsEarned = Math.floor(finalGrandTotal / LOYALTY_POINT_RULES.DOORPRIZE_SPEND_PER_COUPON);

    // 1. Integrasi Pemotongan Stok Terpadu (Single Source of Truth)
    setProducts((prevProducts) =>
      prevProducts.map((prod) => {
        const orderItemsForProd = items.filter(
          (it) => it.productId === prod.id || (it.id && it.id === prod.id),
        );
        if (orderItemsForProd.length === 0) return prod;

        let totalBaseUnitsDeducted = 0;
        orderItemsForProd.forEach((it) => {
          // If multiplier is not explicitly provided, deduce multiplier from unit or tier
          let mult = it.multiplier;
          if (!mult || mult <= 0) {
            if (it.selectedTier === 'PALET') {
              mult = prod.paletMultiplier || prod.unitsPerPack * 10;
            } else if (it.selectedTier === 'BAL' && prod.packUnitName === 'bal') {
              mult = prod.unitsPerPack;
            } else if (it.selectedTier === 'BAL') {
              mult = prod.unitsPerPack * 2;
            } else {
              mult = prod.unitsPerPack || 1;
            }
          }
          const qty = it.selectedQty || it.quantity || 1;
          totalBaseUnitsDeducted += qty * mult;
        });

        const newStock = Math.max(0, prod.totalStockInBaseUnits - totalBaseUnitsDeducted);
        return {
          ...prod,
          totalStockInBaseUnits: newStock,
        };
      }),
    );

    // 2. Generate Kupon Doorprize Resmi (Master Format: ORT-KUPYYMM-urutan)
    const newCouponCodes = issueDoorprizeCoupons(couponsEarned);

    // 3. Mutasi Poin & History Member
    const paymentDesc =
      paymentType === 'CASH'
        ? 'LUNAS CASH'
        : `TERMIN/KREDIT (TOP ${topOptions?.topDays || 14} Hari - JT: ${topOptions?.dueDate || 'N/A'})`;

    const historyRecord: PointMutationRecord = {
      id: `mut-${Date.now()}`,
      memberId: activeMember.id,
      date: new Date().toLocaleString('id-ID'),
      invoiceNumber,
      channel: isUkm ? 'UKM_SUPPLY' : 'GROSIR',
      description: `${isUkm ? 'B2B Pasokan UKM Kuliner' : 'Partai Grosir Distribusi'} kepada ${customerName} (${paymentDesc})${tierDiscount > 0 ? ' [Diskon Platinum 1% Aktif]' : ''}`,
      transactionAmount: finalGrandTotal,
      pointsEarned,
      couponsEarned,
    };

    setActiveMember((prev) => {
      const updated: MemberOneIdentity = {
        ...prev,
        totalLoyaltyPoints: prev.totalLoyaltyPoints + pointsEarned,
        totalSpendMonth: prev.totalSpendMonth + finalGrandTotal,
        doorprizeCouponsCount: prev.doorprizeCouponsCount + couponsEarned,
        doorprizeCoupons: [...newCouponCodes, ...(prev.doorprizeCoupons || [])],
        pointHistory: [historyRecord, ...(prev.pointHistory || [])],
      };

      setMembersList((list) => list.map((m) => (m.id === prev.id ? updated : m)));
      return updated;
    });

    // 4. Update Pembukuan Live Akuntansi SAK (Piutang Usaha jika Termin)
    const estimatedHPP = Math.round(finalGrandTotal * 0.8);
    setFinancials((prev) => ({
      ...prev,
      grosirRevenue: !isUkm ? prev.grosirRevenue + finalGrandTotal : prev.grosirRevenue,
      ukmSupplyRevenue: isUkm ? prev.ukmSupplyRevenue + finalGrandTotal : prev.ukmSupplyRevenue,
      cogsCost: prev.cogsCost + estimatedHPP,
      cashAndBank: paymentType === 'CASH' ? prev.cashAndBank + finalGrandTotal : prev.cashAndBank,
      accountsReceivable:
        paymentType === 'TERMIN' ? prev.accountsReceivable + finalGrandTotal : prev.accountsReceivable,
      inventoryValue: Math.max(0, prev.inventoryValue - estimatedHPP),
      totalTransactionsCount: prev.totalTransactionsCount + 1,
    }));

    // 5. Store in Dexie IndexedDB for Offline Resilience
    localDb.offlineTransactions
      .add({
        invoiceNumber,
        channel: isUkm ? 'UKM_SUPPLY' : 'GROSIR_B2B',
        items: items.map((it) => ({
          productId: it.productId,
          name: it.productName || it.name,
          barcode: it.barcode || '',
          price: it.unitPrice || it.dusPrice || it.price || 0,
          quantity: it.quantity || it.selectedQty || 1,
          subtotal:
            it.subtotal ||
            (it.quantity || it.selectedQty || 1) *
              (it.unitPrice || it.dusPrice || it.price || 0),
        })),
        grandTotal,
        paymentMethod:
          paymentType === 'CASH'
            ? 'CASH'
            : `TERMS_OF_PAYMENT_TOP_${topOptions?.topDays || 14}D`,
        cashierId: currentUser.id,
        memberCode: activeMember.memberCode,
        isSynced: true,
        createdAt: new Date(),
      })
      .catch((err) => console.warn('[localDb.offlineTransactions B2B] Save error:', err));

    // 6. Notify Backend API
    posApi
      .checkout({
        invoiceNumber,
        transactionType: isUkm ? 'UKM_SUPPLY' : 'GROSIR_B2B',
        grandTotal,
        paidAmount: paymentType === 'CASH' ? grandTotal : 0,
        paymentMethod: paymentType === 'CASH' ? 'CASH' : 'TERMS_OF_PAYMENT',
        cashierId: currentUser.id,
        memberCode: activeMember.memberCode,
        customerName,
        channel: isUkm ? 'UKM_SUPPLY' : 'GROSIR',
        topDays: topOptions?.topDays,
        dueDate: topOptions?.dueDate,
      })
      .catch((err) => console.warn('[posApi.checkout B2B] API error:', err));

    return {
      invoiceNumber,
      pointsEarned,
      couponsEarned,
      couponCodes: newCouponCodes,
      channel: isUkm ? ('UKM_SUPPLY' as const) : ('GROSIR' as const),
      topDays: topOptions?.topDays,
      dueDate: topOptions?.dueDate,
    };
  };

  const addGrosirTransaction = addB2BTransaction;

  // ==========================================
  // Waste Purchasing (Circular Economy POS)
  // ==========================================
  const recordWastePurchase = (data: {
    sellerMemberId: string;
    sellerName: string;
    operatorId: string;
    locationPartnerId: string;
    wasteCategory: string;
    grossWeightKg: number;
    tareWeightKg?: number;
    netWeightKg: number;
    pricePerKg: number;
    factorySellingPricePerKg: number;
    partnerProfitSharePct?: number;
    qualityGrade?: 'SUPER' | 'STANDAR' | 'KERUH';
    notes?: string;
    payoutMethod?: 'CASH' | 'ORIENTAL_PAY';
  }): WastePurchaseRecord => {
    const netWeight =
      data.netWeightKg > 0
        ? data.netWeightKg
        : Math.max(0, data.grossWeightKg - (data.tareWeightKg || 0));
    const totalCostPaid = Math.round(netWeight * data.pricePerKg);
    const pointsAwarded = Math.floor(netWeight / LOYALTY_POINT_RULES.WASTE_KG_PER_POINT); // 1 kg = 1 Poin

    // Margin kotor = (Harga Jual Pabrik - Harga Beli) * Berat Bersih (Kg)
    const grossMargin = Math.round((data.factorySellingPricePerKg - data.pricePerKg) * netWeight);

    // PRD v2.1 Addendum §2.3: Bagi hasil diubah menjadi flat 5% dari total nilai beli yang dibayarkan kepada nasabah (bukan 10% dari margin kotor lagi)
    const profitSharePct = data.partnerProfitSharePct ?? 5;
    const partnerEarnedAmount = Math.round((totalCostPaid * profitSharePct) / 100);

    const partner = wastePartners.find((p) => p.id === data.locationPartnerId);
    if (partner) {
      setWastePartners((prev) =>
        prev.map((p) =>
          p.id === partner.id
            ? {
                ...p,
                totalWeightCollectedKg: p.totalWeightCollectedKg + netWeight,
                totalEarnings: p.totalEarnings + partnerEarnedAmount,
                unpaidEarnings: p.unpaidEarnings + partnerEarnedAmount,
              }
            : p,
        ),
      );
    }

    const receiptNumber = `WST-2609-${(wasteHistory.length + 1).toString().padStart(3, '0')}`;
    const newRecord: WastePurchaseRecord = {
      id: `wst-${Date.now().toString().slice(-6)}`,
      receiptNumber,
      sellerMemberId: data.sellerMemberId,
      sellerName: data.sellerName || 'Penyetor Umum',
      operatorId: data.operatorId || currentUser.id,
      locationPartnerId: data.locationPartnerId,
      locationPartnerName: partner ? partner.name : 'Drop Point Utama',
      wasteCategory: data.wasteCategory,
      grossWeightKg: data.grossWeightKg,
      tareWeightKg: data.tareWeightKg || 0,
      netWeightKg: netWeight,
      pricePerKg: data.pricePerKg,
      factorySellingPricePerKg: data.factorySellingPricePerKg,
      totalCostPaid,
      grossMargin,
      partnerProfitSharePct: profitSharePct,
      partnerEarnedAmount,
      pointsAwarded,
      qualityGrade: data.qualityGrade || 'STANDAR',
      notes: data.notes,
      createdAt: new Date(),
    };

    setWasteHistory((prev) => [newRecord, ...prev]);

    // 1. Mutasi Poin & Saldo Oriental Pay jika Penyetor adalah Member
    if (data.sellerMemberId && data.sellerMemberId !== 'NON_MEMBER') {
      const isOrientalPayPayout = data.payoutMethod === 'ORIENTAL_PAY';

      const historyRecord: PointMutationRecord = {
        id: `mut-${Date.now()}`,
        memberId: data.sellerMemberId,
        date: new Date().toLocaleString('id-ID'),
        invoiceNumber: receiptNumber,
        channel: 'WASTE',
        description: `Setor ${netWeight.toFixed(1)} kg ${data.wasteCategory} di ${partner ? partner.name : 'Drop Point'}${isOrientalPayPayout ? ' (Pencairan ke Oriental Pay)' : ' (Cash)'}`,
        transactionAmount: totalCostPaid,
        pointsEarned: pointsAwarded,
        couponsEarned: 0,
      };

      setMembersList((prevList) =>
        prevList.map((m) => {
          if (m.id === data.sellerMemberId || m.memberCode === data.sellerMemberId) {
            const currentBal = m.orientalPayBalance || 0;
            const newBal = isOrientalPayPayout ? currentBal + totalCostPaid : currentBal;
            const opTx: OrientalPayTransactionRecord | null = isOrientalPayPayout
              ? {
                  id: `op-tx-${Date.now().toString().slice(-6)}`,
                  memberId: m.id,
                  type: 'WASTE_PAYOUT',
                  amount: totalCostPaid,
                  balanceAfter: newBal,
                  description: `Hasil Setor ${data.wasteCategory} (${receiptNumber})`,
                  referenceId: receiptNumber,
                  createdAt: new Date().toISOString(),
                }
              : null;

            return {
              ...m,
              orientalPayBalance: newBal,
              orientalPayHistory: opTx ? [opTx, ...(m.orientalPayHistory || [])] : m.orientalPayHistory,
              totalLoyaltyPoints: m.totalLoyaltyPoints + pointsAwarded,
              pointHistory: [historyRecord, ...(m.pointHistory || [])],
            };
          }
          return m;
        }),
      );

      if (activeMember.id === data.sellerMemberId || activeMember.memberCode === data.sellerMemberId) {
        setActiveMember((prev) => {
          const currentBal = prev.orientalPayBalance || 0;
          const newBal = isOrientalPayPayout ? currentBal + totalCostPaid : currentBal;
          const opTx: OrientalPayTransactionRecord | null = isOrientalPayPayout
            ? {
                id: `op-tx-${Date.now().toString().slice(-6)}`,
                memberId: prev.id,
                type: 'WASTE_PAYOUT',
                amount: totalCostPaid,
                balanceAfter: newBal,
                description: `Hasil Setor ${data.wasteCategory} (${receiptNumber})`,
                referenceId: receiptNumber,
                createdAt: new Date().toISOString(),
              }
            : null;

          return {
            ...prev,
            orientalPayBalance: newBal,
            orientalPayHistory: opTx ? [opTx, ...(prev.orientalPayHistory || [])] : prev.orientalPayHistory,
            totalLoyaltyPoints: prev.totalLoyaltyPoints + pointsAwarded,
            pointHistory: [historyRecord, ...(prev.pointHistory || [])],
          };
        });
      }
    }

    // 2. Update Pembukuan Live Akuntansi SAK
    setFinancials((prev) => {
      const updatedWastePillar: PillarFinancials = {
        ...prev.pillars.WASTE,
        revenue: prev.pillars.WASTE.revenue + Math.round(netWeight * data.factorySellingPricePerKg),
        cogs: prev.pillars.WASTE.cogs + totalCostPaid,
        grossProfit: prev.pillars.WASTE.grossProfit + grossMargin,
        operatingExpenses: prev.pillars.WASTE.operatingExpenses + partnerEarnedAmount,
        netProfit: prev.pillars.WASTE.netProfit + (grossMargin - partnerEarnedAmount),
        cashAndBank: prev.pillars.WASTE.cashAndBank - totalCostPaid,
        inventory: prev.pillars.WASTE.inventory + totalCostPaid,
        liabilities: prev.pillars.WASTE.liabilities + partnerEarnedAmount,
      };

      return {
        ...prev,
        wastePurchasesTotal: prev.wastePurchasesTotal + totalCostPaid,
        wasteFactoryValueTotal: prev.wasteFactoryValueTotal + Math.round(netWeight * data.factorySellingPricePerKg),
        wasteShareExpense: prev.wasteShareExpense + partnerEarnedAmount,
        cashAndBank: prev.cashAndBank - totalCostPaid,
        inventoryValue: prev.inventoryValue + totalCostPaid,
        wasteInventoryValue: prev.wasteInventoryValue + totalCostPaid,
        wastePayable: prev.wastePayable + partnerEarnedAmount,
        totalTransactionsCount: prev.totalTransactionsCount + 1,
        pillars: {
          ...prev.pillars,
          WASTE: updatedWastePillar,
        },
      };
    });

    // 3. Store in Dexie IndexedDB for Offline Resilience
    localDb.offlineTransactions
      .add({
        invoiceNumber: receiptNumber,
        channel: 'WASTE_PURCHASE',
        items: [
          {
            productId: data.wasteCategory,
            name: `${data.wasteCategory} (${netWeight} kg)`,
            barcode: 'WASTE-UCO',
            price: data.pricePerKg,
            quantity: netWeight,
            subtotal: totalCostPaid,
          },
        ],
        grandTotal: totalCostPaid,
        paymentMethod: 'CASH',
        cashierId: currentUser.id,
        memberCode: data.sellerMemberId,
        isSynced: true,
        createdAt: new Date(),
      })
      .catch((err) => console.warn('[localDb.offlineTransactions WASTE] Save error:', err));

    // 4. Notify Backend API
    wasteApi
      .recordPurchase({
        sellerMemberId: data.sellerMemberId,
        sellerName: data.sellerName,
        operatorId: data.operatorId || currentUser.id,
        locationPartnerId: data.locationPartnerId,
        wasteCategory: data.wasteCategory,
        grossWeightKg: data.grossWeightKg,
        tareWeightKg: data.tareWeightKg || 0,
        netWeightKg: netWeight,
        pricePerKg: data.pricePerKg,
        factorySellingPricePerKg: data.factorySellingPricePerKg,
        partnerProfitSharePct: profitSharePct,
        qualityGrade: data.qualityGrade || 'STANDAR',
        notes: data.notes,
      })
      .catch((err) => console.warn('[wasteApi.recordPurchase] API notice:', err));

    return newRecord;
  };

  // ==========================================
  // White Label Production & B2B UKM Supply
  // ==========================================
  const registerWhiteLabelVendor = (
    dto: Omit<WhiteLabelVendor, 'id' | 'code' | 'isActive'>,
  ): WhiteLabelVendor => {
    const newVendor: WhiteLabelVendor = {
      id: `vdr-${(whiteLabelVendors.length + 1).toString().padStart(2, '0')}`,
      code: `VDR-${Date.now().toString().slice(-4)}`,
      ...dto,
      isActive: true,
    };
    setWhiteLabelVendors((prev) => [...prev, newVendor]);
    whiteLabelApi.registerVendor(dto).catch((err) => console.warn('[whiteLabelApi.registerVendor] API notice:', err));
    return newVendor;
  };

  const createWhiteLabelContract = (
    dto: Omit<WhiteLabelContract, 'id' | 'contractNumber' | 'status'>,
  ): WhiteLabelContract => {
    const newContract: WhiteLabelContract = {
      id: `ctr-${(whiteLabelContracts.length + 1).toString().padStart(2, '0')}`,
      contractNumber: `MKL-2026-${(whiteLabelContracts.length + 1).toString().padStart(3, '0')}`,
      ...dto,
      status: 'ACTIVE',
    };
    setWhiteLabelContracts((prev) => [...prev, newContract]);
    whiteLabelApi.createContract(dto).catch((err) => console.warn('[whiteLabelApi.createContract] API notice:', err));
    return newContract;
  };

  const receiveWhiteLabelBatch = (data: {
    contractId: string;
    batchNumber: string;
    receivedQuantity: number;
    qcPassed: boolean;
    qcNotes?: string;
  }): WhiteLabelBatchReceipt => {
    const contract = whiteLabelContracts.find((c) => c.id === data.contractId);
    if (!contract) {
      throw new Error('Kontrak maklon tidak ditemukan');
    }

    const totalValue = data.receivedQuantity * contract.productionCostPerUnit;
    const newReceipt: WhiteLabelBatchReceipt = {
      id: `grn-${Date.now().toString().slice(-6)}`,
      receiptNumber: `GRN-2609-${(whiteLabelReceipts.length + 1).toString().padStart(3, '0')}`,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      vendorId: contract.vendorId,
      vendorName: contract.vendorName,
      productName: contract.productName,
      batchNumber: data.batchNumber,
      receivedQuantity: data.receivedQuantity,
      unit: contract.unit,
      costPerUnit: contract.productionCostPerUnit,
      totalValue,
      qcPassed: data.qcPassed,
      qcNotes: data.qcNotes || 'Lolos QC Standar',
      receivedDate: new Date().toISOString().split('T')[0],
    };

    setWhiteLabelReceipts((prev) => [newReceipt, ...prev]);

    if (data.qcPassed) {
      setWhiteLabelCatalog((prev) =>
        prev.map((item) =>
          item.contractId === contract.id
            ? { ...item, stockAvailable: item.stockAvailable + data.receivedQuantity }
            : item,
        ),
      );

      // SAK Ledger: Tambah persediaan
      setFinancials((prev) => ({
        ...prev,
        inventoryValue: prev.inventoryValue + totalValue,
        pillars: {
          ...prev.pillars,
          WHITE_LABEL: {
            ...prev.pillars.WHITE_LABEL,
            inventory: prev.pillars.WHITE_LABEL.inventory + totalValue,
          },
        },
      }));
    }

    whiteLabelApi.receiveBatch(data).catch((err) => console.warn('[whiteLabelApi.receiveBatch] API notice:', err));

    return newReceipt;
  };

  // USER DIRECTIVE: Point diterima oleh costumer oriental khusus B2B Ukm Supply (e.g. Cafe, Resto).
  // Semisal, Cafe memesan roti manis (pabrikan mitra whitelabel oriental) melalui oriental Ekosistem.
  // Maka nominal transaksi setiap Rp 10.000, costumer B2B UKM Supply mendapatkan 1 point!
  const orderWhiteLabelProduct = (data: {
    customerMemberId: string;
    customerName: string;
    customerSegment: string;
    productId: string;
    quantity: number;
  }): WhiteLabelB2BOrder => {
    const product = whiteLabelCatalog.find((p) => p.id === data.productId);
    if (!product) {
      throw new Error('Produk white label tidak ditemukan');
    }
    if (product.stockAvailable < data.quantity) {
      throw new Error(`Stok tidak mencukupi (Tersedia: ${product.stockAvailable})`);
    }

    const totalAmount = data.quantity * product.priceToB2B;
    const pointsAwarded = Math.floor(totalAmount / LOYALTY_POINT_RULES.WHITE_LABEL_SPEND_PER_POINT); // Rp 10.000 = 1 Poin

    // Decrement stock
    setWhiteLabelCatalog((prev) =>
      prev.map((item) =>
        item.id === product.id ? { ...item, stockAvailable: item.stockAvailable - data.quantity } : item,
      ),
    );

    const orderNumber = `WLO-2609-${(whiteLabelOrders.length + 1).toString().padStart(3, '0')}`;
    const newOrder: WhiteLabelB2BOrder = {
      id: `wlo-${Date.now().toString().slice(-6)}`,
      orderNumber,
      customerMemberId: data.customerMemberId,
      customerName: data.customerName,
      customerSegment: data.customerSegment,
      productId: product.id,
      productName: product.name,
      quantity: data.quantity,
      unitPrice: product.priceToB2B,
      totalAmount,
      pointsAwarded,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'DELIVERED',
    };

    setWhiteLabelOrders((prev) => [newOrder, ...prev]);

    // Berikan poin ke Customer B2B UKM Supply
    const historyRecord: PointMutationRecord = {
      id: `mut-${Date.now()}`,
      memberId: data.customerMemberId,
      date: new Date().toLocaleString('id-ID'),
      invoiceNumber: orderNumber,
      channel: 'WHITE_LABEL',
      description: `Pemesanan Produk Maklon: ${data.quantity} ${product.unit} ${product.name}`,
      transactionAmount: totalAmount,
      pointsEarned: pointsAwarded,
      couponsEarned: 0,
    };

    setMembersList((prevList) =>
      prevList.map((m) => {
        if (m.id === data.customerMemberId || m.memberCode === data.customerMemberId) {
          return {
            ...m,
            totalLoyaltyPoints: m.totalLoyaltyPoints + pointsAwarded,
            totalSpendMonth: m.totalSpendMonth + totalAmount,
            pointHistory: [historyRecord, ...(m.pointHistory || [])],
          };
        }
        return m;
      }),
    );

    if (activeMember.id === data.customerMemberId || activeMember.memberCode === data.customerMemberId) {
      setActiveMember((prev) => ({
        ...prev,
        totalLoyaltyPoints: prev.totalLoyaltyPoints + pointsAwarded,
        totalSpendMonth: prev.totalSpendMonth + totalAmount,
        pointHistory: [historyRecord, ...(prev.pointHistory || [])],
      }));
    }

    // Update SAK Accounting
    const contract = whiteLabelContracts.find((c) => c.id === product.contractId);
    const estimatedHPP = contract ? data.quantity * contract.productionCostPerUnit : Math.round(totalAmount * 0.7);

    setFinancials((prev) => {
      const updatedWhiteLabelPillar: PillarFinancials = {
        ...prev.pillars.WHITE_LABEL,
        revenue: prev.pillars.WHITE_LABEL.revenue + totalAmount,
        cogs: prev.pillars.WHITE_LABEL.cogs + estimatedHPP,
        grossProfit: prev.pillars.WHITE_LABEL.grossProfit + (totalAmount - estimatedHPP),
        netProfit: prev.pillars.WHITE_LABEL.netProfit + (totalAmount - estimatedHPP),
        cashAndBank: prev.pillars.WHITE_LABEL.cashAndBank + totalAmount,
        inventory: Math.max(0, prev.pillars.WHITE_LABEL.inventory - estimatedHPP),
      };

      return {
        ...prev,
        whiteLabelRevenue: prev.whiteLabelRevenue + totalAmount,
        cogsCost: prev.cogsCost + estimatedHPP,
        cashAndBank: prev.cashAndBank + totalAmount,
        inventoryValue: Math.max(0, prev.inventoryValue - estimatedHPP),
        totalTransactionsCount: prev.totalTransactionsCount + 1,
        pillars: {
          ...prev.pillars,
          WHITE_LABEL: updatedWhiteLabelPillar,
        },
      };
    });

    // Store in Dexie IndexedDB for offline resilience
    localDb.offlineTransactions
      .add({
        invoiceNumber: orderNumber,
        channel: 'WHITE_LABEL',
        items: [
          {
            productId: product.id,
            name: product.name,
            barcode: product.sku,
            price: product.priceToB2B,
            quantity: data.quantity,
            subtotal: totalAmount,
          },
        ],
        grandTotal: totalAmount,
        paymentMethod: 'CASH',
        cashierId: currentUser.id,
        memberCode: data.customerMemberId,
        isSynced: true,
        createdAt: new Date(),
      })
      .catch((err) => console.warn('[localDb.offlineTransactions WHITE_LABEL] Save error:', err));

    // Notify backend API
    whiteLabelApi.orderProduct(data).catch((err) => console.warn('[whiteLabelApi.orderProduct] API notice:', err));

    return newOrder;
  };

  // ==========================================
  // Sprint 5: Standing Orders (Weekly Delivery) Handlers
  // ==========================================
  const createStandingOrder = (
    dto: Omit<StandingOrder, 'id' | 'orderNumber' | 'status' | 'createdAt'>,
  ): StandingOrder => {
    const orderNumber = `SO-202609-${String(standingOrders.length + 1).padStart(3, '0')}`;
    const newOrder: StandingOrder = {
      id: `so-${Date.now().toString().slice(-6)}`,
      orderNumber,
      ...dto,
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    setStandingOrders((prev) => [newOrder, ...prev]);

    referralApi.createStandingOrder(dto).catch((err) =>
      console.warn('[referralApi.createStandingOrder] API notice:', err),
    );

    return newOrder;
  };

  const toggleStandingOrderStatus = (id: string, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED') => {
    setStandingOrders((prev) =>
      prev.map((so) => (so.id === id ? { ...so, status } : so)),
    );
    referralApi.updateStandingOrderStatus(id, status).catch((err) =>
      console.warn('[referralApi.updateStandingOrderStatus] API notice:', err),
    );
  };

  const dispatchStandingOrder = (id: string) => {
    const order = standingOrders.find((so) => so.id === id);
    if (!order) throw new Error('Standing order tidak ditemukan.');

    const invSeq = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `INV-UKM-SO-${invSeq}`;
    const totalAmount = order.totalAmountPerDelivery;
    // B2B UKM Supply Loyalty Rule: Rp 10.000 = 1 Poin
    const pointsEarned = Math.floor(totalAmount / LOYALTY_POINT_RULES.WHITE_LABEL_SPEND_PER_POINT);

    // Update customer member points and mutations
    setMembersList((prev) =>
      prev.map((m) => {
        if (m.id === order.customerMemberId) {
          const newPts = m.totalLoyaltyPoints + pointsEarned;
          const newSpend = m.totalSpendMonth + totalAmount;
          const newHistory = [
            {
              id: `mut-${Date.now().toString().slice(-6)}`,
              memberId: m.id,
              date: new Date().toLocaleString('id-ID'),
              invoiceNumber,
              channel: 'UKM_SUPPLY' as const,
              description: `Pengiriman Pasokan Rutin (${order.frequencyLabel}) - SO #${order.orderNumber}`,
              transactionAmount: totalAmount,
              pointsEarned,
              couponsEarned: 0,
            },
            ...(m.pointHistory || []),
          ];
          return {
            ...m,
            totalLoyaltyPoints: newPts,
            totalSpendMonth: newSpend,
            pointHistory: newHistory,
          };
        }
        return m;
      }),
    );

    // Update financial ledger
    setFinancials((prev) => ({
      ...prev,
      ukmSupplyRevenue: prev.ukmSupplyRevenue + totalAmount,
      cashAndBank: prev.cashAndBank + totalAmount,
      totalTransactionsCount: prev.totalTransactionsCount + 1,
      pillars: {
        ...prev.pillars,
        UKM_SUPPLY: {
          ...prev.pillars.UKM_SUPPLY,
          revenue: prev.pillars.UKM_SUPPLY.revenue + totalAmount,
          cashAndBank: prev.pillars.UKM_SUPPLY.cashAndBank + totalAmount,
          grossProfit: prev.pillars.UKM_SUPPLY.grossProfit + Math.round(totalAmount * 0.2),
          netProfit: prev.pillars.UKM_SUPPLY.netProfit + Math.round(totalAmount * 0.12),
        },
      },
    }));

    return { invoiceNumber, totalAmount, pointsEarned };
  };

  // ==========================================
  // Sprint 5: Referral Engine (Business 0.5% & Influencer 1.0%) Handlers
  // ==========================================
  const evaluateBusinessReferral = (referrerSpend: number, refereeSpend: number) => {
    const REFERRER_MIN_SPEND = 60000000; // Rp 60 Juta
    const REFEREE_MIN_SPEND = 30000000;  // Rp 30 Juta

    if (referrerSpend < REFERRER_MIN_SPEND) {
      return {
        qualified: false,
        ratePct: 0,
        referrerSpendMonth: referrerSpend,
        refereeSpendMonth: refereeSpend,
        reason: `Pengusul belum mencapai batas belanja Rp 60 Juta/bln (Saat ini: Rp ${referrerSpend.toLocaleString('id-ID')})`,
      };
    }

    if (refereeSpend < REFEREE_MIN_SPEND) {
      return {
        qualified: false,
        ratePct: 0,
        referrerSpendMonth: referrerSpend,
        refereeSpendMonth: refereeSpend,
        reason: `Rekan usaha belum mencapai batas belanja Rp 30 Juta/bln (Saat ini: Rp ${refereeSpend.toLocaleString('id-ID')})`,
      };
    }

    const commissionEarnedEstimate = Math.round((refereeSpend * 0.5) / 100);
    return {
      qualified: true,
      ratePct: 0.5,
      referrerSpendMonth: referrerSpend,
      refereeSpendMonth: refereeSpend,
      commissionEarnedEstimate,
      reason: 'Memenuhi syarat komisi referral bisnis 0.5%',
    };
  };

  const recordBusinessReferralCommission = (
    referrerId: string,
    refereeId: string,
    transactionAmount: number,
  ): ReferralCommission => {
    const ratePct = 0.5;
    const commissionAmount = Math.round((transactionAmount * ratePct) / 100);
    const newComm: ReferralCommission = {
      id: `comm-biz-${Date.now().toString().slice(-6)}`,
      referralType: ReferralType.BUSINESS,
      referrerId,
      refereeId,
      sourceTransactionId: `TX-B2B-${Date.now().toString().slice(-6)}`,
      transactionAmount,
      commissionRatePct: ratePct,
      commissionAmount,
      isPaidOut: false,
      createdAt: new Date(),
    };
    setCommissions((prev) => [newComm, ...prev]);

    referralApi
      .recordBusiness(referrerId, refereeId, transactionAmount)
      .catch((err: any) => console.warn('[referralApi.recordBusiness] API notice:', err));

    return newComm;
  };

  const recordInfluencerReferralCommission = (
    productSaleAmount: number,
    influencerId: string,
  ): ReferralCommission => {
    const ratePct = 1.0;
    const commissionAmount = Math.round((productSaleAmount * ratePct) / 100);
    const newComm: ReferralCommission = {
      id: `comm-inf-${Date.now().toString().slice(-6)}`,
      referralType: ReferralType.INFLUENCER,
      referrerId: influencerId,
      sourceTransactionId: `TX-INF-${Date.now().toString().slice(-6)}`,
      transactionAmount: productSaleAmount,
      commissionRatePct: ratePct,
      commissionAmount,
      isPaidOut: false,
      createdAt: new Date(),
    };
    setCommissions((prev) => [newComm, ...prev]);

    referralApi
      .calculateInfluencer(productSaleAmount, influencerId)
      .catch((err: any) => console.warn('[referralApi.calculateInfluencer] API notice:', err));

    return newComm;
  };

  const getCommissionWallet = (memberId: string) => {
    const memberComms = commissions.filter(
      (c) => c.referrerId === memberId || memberId === 'ALL',
    );
    const memberWdrs = withdrawals.filter(
      (w) => w.memberId === memberId || memberId === 'ALL',
    );
    const totalEarned = memberComms.reduce((acc, c) => acc + c.commissionAmount, 0);
    const totalWithdrawn = memberWdrs
      .filter((w) => w.status === 'TRANSFERRED' || w.status === 'APPROVED' || w.status === 'PENDING')
      .reduce((acc, w) => acc + w.amount, 0);
    const availableBalance = Math.max(0, totalEarned - totalWithdrawn);
    return {
      totalEarned,
      totalWithdrawn,
      availableBalance,
      commissionsCount: memberComms.length,
      withdrawalsCount: memberWdrs.length,
    };
  };

  const requestCommissionWithdrawal = (dto: {
    memberId: string;
    memberName: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  }): CommissionWithdrawalRequest => {
    const wallet = getCommissionWallet(dto.memberId);
    if (dto.amount <= 0) {
      throw new Error('Nominal penarikan harus lebih dari 0.');
    }
    if (dto.amount > wallet.availableBalance) {
      throw new Error(
        `Saldo komisi tidak mencukupi. Tersedia: Rp ${wallet.availableBalance.toLocaleString('id-ID')}`,
      );
    }

    const requestNumber = `WDR-202609-${String(withdrawals.length + 1).padStart(4, '0')}`;
    const req: CommissionWithdrawalRequest = {
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

    setWithdrawals((prev) => [req, ...prev]);

    // Financial ledger impact: cash withdrawal for commission expense
    setFinancials((prev) => ({
      ...prev,
      cashAndBank: Math.max(0, prev.cashAndBank - dto.amount),
    }));

    referralApi
      .requestWithdrawal(dto)
      .catch((err: any) => console.warn('[referralApi.requestWithdrawal] API notice:', err));

    return req;
  };

  // ==========================================
  // Sprint 6: SAK Reporting & Oriental Learn Handlers
  // ==========================================
  const submitQuizAttempt = (dto: QuizSubmissionDto): QuizResult => {
    const course = courses.find((c) => c.id === dto.courseId);
    if (!course) throw new Error('Modul kursus tidak ditemukan.');

    const totalQuestions = course.quizQuestions.length;
    let correctCount = 0;
    course.quizQuestions.forEach((q, idx) => {
      if (dto.answers[idx] === q.correctAnswerIndex) correctCount += 1;
    });

    const scorePct = Math.round((correctCount / totalQuestions) * 100);
    // Acceptance Criteria 2: Score > 80% qualifies for certificate
    const passed = scorePct > 80;

    let certificate: DigitalCertificate | undefined;
    if (passed) {
      const certSeq = (certificates.length + 1).toString().padStart(4, '0');
      const certNumber = `CERT-ORT-202609-${certSeq}`;
      certificate = {
        id: `cert-${Date.now().toString().slice(-6)}`,
        certificateNumber: certNumber,
        memberId: dto.memberId,
        memberName: dto.memberName,
        businessName: activeMember.businessName,
        courseTitle: course.title,
        category: course.categoryLabel,
        scorePct,
        issueDate: new Date().toISOString().split('T')[0],
        qrCodeUrl: `https://oriental.co.id/verify-cert/${certNumber}`,
        verificationHash: `SHA256-${Date.now().toString(16).toUpperCase()}`,
      };
      setCertificates((prev) => [certificate!, ...prev]);
    }

    const feedback = passed
      ? `Selamat! Anda lulus kuis dengan skor ${scorePct}% (> 80%). Sertifikat digital resmi ber-QR Code telah diterbitkan dan dapat langsung diunduh!`
      : `Skor Anda adalah ${scorePct}%. Minimal kelulusan sertifikasi adalah > 80%. Silakan tinjau kembali video modul dan ulangi kuis.`;

    accountingApi.submitQuiz(dto).catch((err: any) => console.warn('[accountingApi.submitQuiz] API notice:', err));

    return {
      courseId: course.id,
      memberId: dto.memberId,
      scorePct,
      passed,
      correctAnswersCount: correctCount,
      totalQuestions,
      certificate,
      feedback,
    };
  };

  const registerWorkshopAttendee = (dto: WorkshopRegistrationDto) => {
    const workshop = workshops.find((w) => w.id === dto.workshopId);
    if (!workshop) throw new Error('Workshop tidak ditemukan.');
    if (workshop.isFull || workshop.registeredCount >= workshop.quota) {
      throw new Error('Kuota workshop telah penuh.');
    }

    setWorkshops((prev) =>
      prev.map((w) => {
        if (w.id === dto.workshopId) {
          const newCount = w.registeredCount + 1;
          return {
            ...w,
            registeredCount: newCount,
            isFull: newCount >= w.quota,
          };
        }
        return w;
      }),
    );

    accountingApi.registerWorkshop(dto).catch((err: any) => console.warn('[accountingApi.registerWorkshop] API notice:', err));

    return {
      success: true,
      registrationId: `REG-WKS-${Date.now().toString().slice(-6)}`,
      workshopTitle: workshop.title,
      workshopDate: workshop.date,
      timeSlot: workshop.timeSlot,
      location: workshop.address,
      attendeeName: dto.memberName,
      phone: dto.phone,
      businessName: dto.businessName,
      status: 'CONFIRMED',
    };
  };

  const exportFinancialStatementDoc = (format: 'PDF' | 'EXCEL', statementType: 'LABA_RUGI' | 'NERACA' | 'ARUS_KAS') => {
    return {
      format,
      statementType,
      exportedAt: new Date().toISOString(),
      documentTitle: `Laporan Keuangan Oriental Ecosystem - ${statementType} (${format})`,
      auditSignOff: {
        company: 'PT Oriental Digital Ekosistem Indonesia',
        accountantCertificationNumber: 'CPA-SAK-2026/09/881',
        isBalancedVerified: true,
      },
    };
  };

  // ==========================================
  // Sprint 7: Closed-Loop Oriental Pay & UKM Loyalty Tiers
  // ==========================================
  const evaluateMemberTier = (rolling3MonthAvg: number) => {
    let tier = CustomerTier.REGULER;
    let nextTierThreshold = 10000000;
    let discountPct = 0;
    let pointBonusPct = 0;
    let warning = false;

    if (rolling3MonthAvg >= 70000000) {
      tier = CustomerTier.PLATINUM;
      nextTierThreshold = 70000000;
      discountPct = 1.0; // 1% invoice discount
      pointBonusPct = 15; // +15% point bonus
    } else if (rolling3MonthAvg >= 40000000) {
      tier = CustomerTier.GOLD;
      nextTierThreshold = 70000000;
      discountPct = 0;
      pointBonusPct = 10; // +10% point bonus
    } else if (rolling3MonthAvg >= 20000000) {
      tier = CustomerTier.SILVER;
      nextTierThreshold = 40000000;
      discountPct = 0;
      pointBonusPct = 0;
    } else if (rolling3MonthAvg >= 10000000) {
      tier = CustomerTier.BRONZE;
      nextTierThreshold = 20000000;
      discountPct = 0;
      pointBonusPct = 0;
    } else {
      tier = CustomerTier.REGULER;
      nextTierThreshold = 10000000;
      discountPct = 0;
      pointBonusPct = 0;
    }

    if (activeMember.totalSpendMonth < (nextTierThreshold * 0.4)) {
      warning = true;
    }

    return {
      tier,
      nextTierThreshold,
      discountPct,
      pointBonusPct,
      warning,
    };
  };

  const payWithOrientalPay = (
    memberId: string,
    amount: number,
    description: string,
    invoiceNumber?: string,
    channel: string = 'RETAIL',
  ): boolean => {
    const targetMember = membersList.find((m) => m.id === memberId || m.memberCode === memberId) || activeMember;
    const currentBal = targetMember.orientalPayBalance || 0;
    if (currentBal < amount) {
      throw new Error(
        `Saldo Oriental Pay tidak mencukupi (Tersedia: Rp ${currentBal.toLocaleString('id-ID')}, Dibutuhkan: Rp ${amount.toLocaleString('id-ID')})`
      );
    }

    const newBalance = currentBal - amount;
    const txRecord: OrientalPayTransactionRecord = {
      id: `op-tx-${Date.now().toString().slice(-6)}`,
      memberId: targetMember.id,
      type: 'PURCHASE_PAYMENT',
      amount: -amount,
      balanceAfter: newBalance,
      description,
      channel,
      referenceId: invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    setMembersList((prev) =>
      prev.map((m) =>
        m.id === targetMember.id
          ? {
              ...m,
              orientalPayBalance: newBalance,
              orientalPayHistory: [txRecord, ...(m.orientalPayHistory || [])],
            }
          : m,
      ),
    );

    if (activeMember.id === targetMember.id) {
      setActiveMember((prev) => ({
        ...prev,
        orientalPayBalance: newBalance,
        orientalPayHistory: [txRecord, ...(prev.orientalPayHistory || [])],
      }));
    }

    return true;
  };

  const topUpOrientalPay = (
    memberId: string,
    amount: number,
    source: 'REFERRAL_COMMISSION' | 'WASTE_PAYOUT' | 'MANUAL_DEPOSIT',
    referenceId?: string,
  ) => {
    if (amount <= 0) return;
    const targetMember = membersList.find((m) => m.id === memberId || m.memberCode === memberId) || activeMember;
    const currentBal = targetMember.orientalPayBalance || 0;
    const newBalance = currentBal + amount;

    const txType =
      source === 'REFERRAL_COMMISSION'
        ? 'REFERRAL_COMMISSION'
        : source === 'WASTE_PAYOUT'
        ? 'WASTE_PAYOUT'
        : 'TOPUP';

    const descMap = {
      REFERRAL_COMMISSION: `Pencairan Komisi Referral ke Dompet Oriental Pay (${referenceId || ''})`,
      WASTE_PAYOUT: `Hasil Setor Minyak Jelantah / Sampah (${referenceId || ''})`,
      MANUAL_DEPOSIT: `Deposit Saldo Dompet Oriental Pay (${referenceId || ''})`,
    };

    const txRecord: OrientalPayTransactionRecord = {
      id: `op-tx-${Date.now().toString().slice(-6)}`,
      memberId: targetMember.id,
      type: txType,
      amount,
      balanceAfter: newBalance,
      description: descMap[source],
      referenceId,
      createdAt: new Date().toISOString(),
    };

    setMembersList((prev) =>
      prev.map((m) =>
        m.id === targetMember.id
          ? {
              ...m,
              orientalPayBalance: newBalance,
              orientalPayHistory: [txRecord, ...(m.orientalPayHistory || [])],
            }
          : m,
      ),
    );

    if (activeMember.id === targetMember.id) {
      setActiveMember((prev) => ({
        ...prev,
        orientalPayBalance: newBalance,
        orientalPayHistory: [txRecord, ...(prev.orientalPayHistory || [])],
      }));
    }
  };

  const generateWasteSettlementClaim = (partnerId: string, periodMonth: string): WastePartnerSettlementClaim => {
    const partner = wastePartners.find((p) => p.id === partnerId);
    if (!partner) throw new Error('Mitra pengumpul tidak ditemukan');

    const partnerRecords = wasteHistory.filter((rec) => {
      const recDate = new Date(rec.createdAt);
      const recMonth = `${recDate.getFullYear()}-${String(recDate.getMonth() + 1).padStart(2, '0')}`;
      return rec.locationPartnerId === partnerId && recMonth === periodMonth;
    });

    const totalKg = partnerRecords.reduce((sum, r) => sum + r.netWeightKg, 0);
    const totalPayout = partnerRecords.reduce((sum, r) => sum + r.totalCostPaid, 0);
    const claimAmount = Math.round((totalPayout * 5) / 100);

    const newClaim: WastePartnerSettlementClaim = {
      id: `wsc-${Date.now().toString().slice(-6)}`,
      claimNumber: `WSC-${periodMonth.replace('-', '')}-${String(wasteSettlementClaims.length + 1).padStart(3, '0')}`,
      partnerId,
      partnerName: partner.name,
      periodMonth,
      totalKgCollected: totalKg || partner.totalWeightCollectedKg,
      totalCustomerPayout: totalPayout || partner.totalWeightCollectedKg * 7500,
      profitSharePct: 5,
      claimAmount: claimAmount || Math.round(partner.totalWeightCollectedKg * 7500 * 0.05),
      status: 'APPROVED',
      notes: `Klaim bagi hasil flat 5% periode ${periodMonth}`,
    };

    setWasteSettlementClaims((prev) => [newClaim, ...prev]);
    return newClaim;
  };

  const generateInfluencerLink = (memberId: string, productId: string): InfluencerProductLink => {
    const targetMember = membersList.find((m) => m.id === memberId || m.memberCode === memberId) || activeMember;
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) throw new Error('Produk tidak ditemukan');

    const affCode = targetMember.influencerAffiliateCode || `ORT-${targetMember.memberCode.slice(-4)}`;
    const basePrice = targetProduct.variants[0]?.price || 10000;

    const existing = influencerLinks.find(
      (l) => l.memberId === targetMember.id && l.productId === productId,
    );
    if (existing) return existing;

    const newLink: InfluencerProductLink = {
      id: `inf-link-${Date.now().toString().slice(-6)}`,
      memberId: targetMember.id,
      affiliateCode: affCode,
      productId: targetProduct.id,
      productName: targetProduct.name,
      productPrice: basePrice,
      commissionPct: 1.0,
      shareUrl: `http://localhost:3000/retail-pos?ref=${affCode}&prod=${targetProduct.id}`,
      clicksCount: 0,
      salesCount: 0,
      totalCommissionEarned: 0,
      createdAt: new Date().toISOString(),
    };

    setInfluencerLinks((prev) => [newLink, ...prev]);
    return newLink;
  };

  // ==========================================
  // Sprint 8: Stock Transfers & Branch Price Proposals Handlers
  // ==========================================
  const createStockTransfer = (dto: {
    sourceOutletId: string;
    targetOutletId: string;
    items: {
      productId: string;
      variantUnitName: string;
      quantity: number;
    }[];
    notes?: string;
    driverName?: string;
    vehiclePlate?: string;
  }): InterStoreTransferRecord => {
    const source = outletsList.find((o) => o.id === dto.sourceOutletId) || outletsList[0];
    const target = outletsList.find((o) => o.id === dto.targetOutletId) || outletsList[1];

    const transferItems: InterStoreTransferItem[] = dto.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const variant = prod?.variants.find((v) => v.unitName.toLowerCase() === it.variantUnitName.toLowerCase()) || prod?.variants[0];
      const mult = variant?.multiplier || prod?.unitsPerPack || 1;
      return {
        productId: it.productId,
        productName: prod?.name || 'Produk',
        variantUnitName: it.variantUnitName,
        quantity: it.quantity,
        multiplierToBaseUnit: mult,
        baseUnitsTotal: it.quantity * mult,
      };
    });

    const totalBaseUnits = transferItems.reduce((acc, it) => acc + it.baseUnitsTotal, 0);
    const transferNumber = `TRF-202609-${String(stockTransfers.length + 1).padStart(3, '0')}`;

    const newTransfer: InterStoreTransferRecord = {
      id: `trf-${Date.now().toString().slice(-6)}`,
      transferNumber,
      sourceOutletId: source.id,
      sourceOutletName: source.name,
      targetOutletId: target.id,
      targetOutletName: target.name,
      status: 'DRAFT',
      items: transferItems,
      totalBaseUnits,
      driverName: dto.driverName,
      vehiclePlate: dto.vehiclePlate,
      notes: dto.notes,
      createdAt: new Date().toISOString(),
    };

    setStockTransfers((prev) => [newTransfer, ...prev]);
    return newTransfer;
  };

  const dispatchStockTransfer = (transferId: string, driverName?: string, vehiclePlate?: string) => {
    const transfer = stockTransfers.find((t) => t.id === transferId);
    setStockTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId) {
          return {
            ...t,
            status: 'IN_TRANSIT',
            driverName: driverName || t.driverName,
            vehiclePlate: vehiclePlate || t.vehiclePlate,
            dispatchedAt: new Date().toISOString(),
            dispatchedBy: currentUser.name,
          };
        }
        return t;
      }),
    );

    // Deduct stock from central/source inventory
    if (transfer) {
      setProducts((prev) =>
        prev.map((prod) => {
          const item = transfer.items.find((it) => it.productId === prod.id);
          if (item) {
            return {
              ...prod,
              totalStockInBaseUnits: Math.max(0, prod.totalStockInBaseUnits - item.baseUnitsTotal),
            };
          }
          return prod;
        }),
      );
    }
  };

  const receiveStockTransfer = (transferId: string, receivedBy?: string) => {
    setStockTransfers((prev) =>
      prev.map((t) => {
        if (t.id === transferId) {
          return {
            ...t,
            status: 'RECEIVED',
            receivedAt: new Date().toISOString(),
            receivedBy: receivedBy || currentUser.name,
          };
        }
        return t;
      }),
    );
  };

  const cancelStockTransfer = (transferId: string) => {
    const transfer = stockTransfers.find((t) => t.id === transferId);
    if (transfer && transfer.status === 'IN_TRANSIT') {
      // Revert deducted stock
      setProducts((prev) =>
        prev.map((prod) => {
          const item = transfer.items.find((it) => it.productId === prod.id);
          if (item) {
            return {
              ...prod,
              totalStockInBaseUnits: prod.totalStockInBaseUnits + item.baseUnitsTotal,
            };
          }
          return prod;
        }),
      );
    }

    setStockTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: 'CANCELLED' } : t)),
    );
  };

  const submitBranchPriceProposal = (dto: {
    outletId: string;
    productId: string;
    proposedPrice: number;
    proposalType: 'PRICE_DROP' | 'LOCAL_PROMO';
    reason: string;
    competitorName: string;
    competitorPrice: number;
    proofAttachments: { name: string; url: string }[];
  }): BranchPriceProposal => {
    if (dto.proofAttachments.length < 4) {
      throw new Error('SOP Addendum §8.1: Wajib mengunggah minimal 4 foto/dokumen bukti perbandingan harga kompetitor!');
    }

    const outlet = outletsList.find((o) => o.id === dto.outletId) || activeOutlet;
    const prod = products.find((p) => p.id === dto.productId);
    const currentPrice = prod?.variants[0]?.price || 30000;
    const proposalNumber = `PRP-202609-${String(branchPriceProposals.length + 1).padStart(3, '0')}`;

    const newProposal: BranchPriceProposal = {
      id: `prp-${Date.now().toString().slice(-6)}`,
      proposalNumber,
      outletId: outlet.id,
      outletName: outlet.name,
      productId: dto.productId,
      productName: prod?.name || 'Produk',
      currentPrice,
      proposedPrice: dto.proposedPrice,
      proposalType: dto.proposalType,
      reason: dto.reason,
      competitorName: dto.competitorName,
      competitorPrice: dto.competitorPrice,
      proofAttachments: dto.proofAttachments.map((att, idx) => ({
        id: `att-${Date.now()}-${idx}`,
        name: att.name,
        url: att.url,
        uploadedAt: new Date().toISOString().split('T')[0],
      })),
      submittedBy: currentUser.name,
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED',
    };

    setBranchPriceProposals((prev) => [newProposal, ...prev]);
    return newProposal;
  };

  const reviewBranchPriceProposal = (proposalId: string, approved: boolean, notes: string) => {
    setBranchPriceProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            status: approved ? 'REVIEWED_BY_REGIONAL' : 'REJECTED',
            regionalReviewerId: currentUser.id,
            regionalReviewNotes: notes,
            regionalReviewedAt: new Date().toISOString(),
          };
        }
        return p;
      }),
    );
  };

  const finalizeBranchPriceProposal = (proposalId: string, approved: boolean, notes: string) => {
    setBranchPriceProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          const finalStatus: PriceProposalStatus = approved ? 'APPROVED_BY_OWNER' : 'REJECTED';
          return {
            ...p,
            status: finalStatus,
            ownerReviewerId: currentUser.id,
            ownerReviewNotes: notes,
            ownerReviewedAt: new Date().toISOString(),
          };
        }
        return p;
      }),
    );

    if (approved) {
      const prop = branchPriceProposals.find((p) => p.id === proposalId);
      if (prop) {
        setProducts((prev) =>
          prev.map((prod) => {
            if (prod.id === prop.productId) {
              return {
                ...prod,
                variants: prod.variants.map((v, idx) =>
                  idx === 0 ? { ...v, price: prop.proposedPrice } : v,
                ),
              };
            }
            return prod;
          }),
        );
      }
    }
  };

  // ==========================================
  // Sprint 9 Handlers: Price Lists, Void, Shift Reconciliation, Credit Lock
  // ==========================================
  const addProductSegmentPrice = (dto: Omit<ProductSegmentPrice, 'id'>): ProductSegmentPrice => {
    const newPrice: ProductSegmentPrice = {
      ...dto,
      id: `psp-${Date.now().toString().slice(-6)}`,
    };
    setProductSegmentPrices((prev) => [newPrice, ...prev]);
    return newPrice;
  };

  const updateProductSegmentPrice = (id: string, updates: Partial<ProductSegmentPrice>) => {
    setProductSegmentPrices((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const deleteProductSegmentPrice = (id: string) => {
    setProductSegmentPrices((prev) => prev.filter((p) => p.id !== id));
  };

  const recordVoidTransaction = (dto: {
    invoiceNumber: string;
    originalAmount: number;
    voidReason: string;
    cashierName: string;
    approvedByManager: string;
    restockedItems: { name: string; qty: number; unit: string }[];
    notes?: string;
  }): VoidAuditRecord => {
    const record: VoidAuditRecord = {
      id: `void-${Date.now().toString().slice(-6)}`,
      invoiceNumber: dto.invoiceNumber,
      originalAmount: dto.originalAmount,
      voidReason: dto.voidReason,
      voidedAt: new Date().toLocaleString('id-ID'),
      cashierName: dto.cashierName,
      approvedByManager: dto.approvedByManager,
      restockedItems: dto.restockedItems,
      notes: dto.notes,
    };
    setVoidAuditRecords((prev) => [record, ...prev]);
    return record;
  };

  const reconcileCashierShift = (shiftId: string, actualCashCounted: number, notes?: string) => {
    setCashierShiftReports((prev) =>
      prev.map((s) => {
        if (s.id === shiftId) {
          const diff = actualCashCounted - s.expectedCashInDrawer;
          const status = diff === 0 ? 'BALANCED' : diff < 0 ? 'SHORTAGE' : 'OVERAGE';
          return {
            ...s,
            actualCashCounted,
            difference: diff,
            status,
            notes: notes || s.notes,
            closedAt: new Date().toLocaleString('id-ID'),
          };
        }
        return s;
      }),
    );
  };

  const checkMemberTopCreditStatus = (memberCode: string, newOrderAmount: number) => {
    const m = membersList.find((x) => x.memberCode === memberCode);
    const limit = m?.creditLimit ?? 20000000;
    const currentReceivables = m?.currentOutstandingReceivables ?? 0;
    const projectedReceivables = currentReceivables + newOrderAmount;
    const hasOverdue = m?.hasOverdueInvoices ?? false;
    const overdueInvoices = m?.overdueInvoiceNumbers ?? [];
    const topAllowedDays = m?.topAllowedDays ?? 14;

    if (hasOverdue) {
      return {
        allowed: false,
        reason: `Transaksi Ditolak: Pelanggan ${m?.fullName || memberCode} memiliki ${overdueInvoices.length} faktur tertunggak yang telah melewati jatuh tempo. Harap lunasi faktur tertunggak terlebih dahulu sesuai kebijakan PRD Addendum §8.1 & §2.5.`,
        creditLimit: limit,
        currentReceivables,
        projectedReceivables,
        hasOverdue,
        overdueInvoices,
        topAllowedDays,
      };
    }

    if (projectedReceivables > limit) {
      const excess = projectedReceivables - limit;
      return {
        allowed: false,
        reason: `Transaksi Ditolak: Plafon Kredit Terlampaui! Plafon: Rp ${limit.toLocaleString('id-ID')}, Piutang Berjalan: Rp ${currentReceivables.toLocaleString('id-ID')}, Order Baru: Rp ${newOrderAmount.toLocaleString('id-ID')}. Total Rp ${projectedReceivables.toLocaleString('id-ID')} melebihi limit sebesar Rp ${excess.toLocaleString('id-ID')}.`,
        creditLimit: limit,
        currentReceivables,
        projectedReceivables,
        hasOverdue,
        overdueInvoices,
        topAllowedDays,
      };
    }

    return {
      allowed: true,
      creditLimit: limit,
      currentReceivables,
      projectedReceivables,
      hasOverdue: false,
      overdueInvoices: [],
      topAllowedDays,
    };
  };

  const settleMemberReceivable = (memberCode: string, amount: number) => {
    setMembersList((prev) =>
      prev.map((m) => {
        if (m.memberCode === memberCode) {
          const newOutstanding = Math.max(0, (m.currentOutstandingReceivables || 0) - amount);
          const resolvedOverdue = newOutstanding === 0 ? false : m.hasOverdueInvoices;
          const remainingOverdueInvoices = newOutstanding === 0 ? [] : m.overdueInvoiceNumbers;
          return {
            ...m,
            currentOutstandingReceivables: newOutstanding,
            hasOverdueInvoices: resolvedOverdue,
            overdueInvoiceNumbers: remainingOverdueInvoices,
          };
        }
        return m;
      }),
    );
  };

  // Synthesize legacy `member` object for any components still consuming MemberState
  const member: MemberState = {
    code: activeMember.memberCode,
    name: activeMember.fullName,
    phone: activeMember.phone,
    segment: `${activeMember.segment} - ${activeMember.businessName || 'Retail Customer'}`,
    totalPoints: activeMember.totalLoyaltyPoints,
    monthlySpend: activeMember.totalSpendMonth,
    doorprizeCoupons: (activeMember.doorprizeCoupons || []).map((c) => ({
      code: c,
      date: new Date().toLocaleDateString('id-ID'),
      source: 'Kupon Undian Resmi',
    })),
    history: (activeMember.pointHistory || []).map((h) => ({
      id: h.id,
      date: h.date,
      invoiceNumber: h.invoiceNumber,
      channel: h.channel as any,
      description: h.description,
      transactionAmount: h.transactionAmount,
      pointsEarned: h.pointsEarned,
      couponsEarned: h.couponsEarned,
    })),
  };

  return (
    <EcosystemContext.Provider
      value={{
        membersList,
        activeMember,
        selectActiveMember,
        registerNewMember,
        member,
        systemUsers,
        currentUser,
        setCurrentUser,
        delegateNewUser,
        toggleUserStatus,
        financials,
        products,
        retailCart,
        addToRetailCart,
        updateRetailCartQty,
        clearRetailCart,
        formatStock,
        addRetailTransaction,
        addB2BTransaction,
        addGrosirTransaction,
        // Waste Purchasing
        wasteCategories,
        wastePartners,
        wasteHistory,
        recordWastePurchase,
        // White Label
        whiteLabelVendors,
        whiteLabelContracts,
        whiteLabelCatalog,
        whiteLabelReceipts,
        whiteLabelOrders,
        registerWhiteLabelVendor,
        createWhiteLabelContract,
        receiveWhiteLabelBatch,
        orderWhiteLabelProduct,
        // Sprint 5: UKM Supply, Standing Orders & Referral Engine
        standingOrders,
        commissions,
        withdrawals,
        createStandingOrder,
        toggleStandingOrderStatus,
        dispatchStandingOrder,
        evaluateBusinessReferral,
        recordBusinessReferralCommission,
        recordInfluencerReferralCommission,
        requestCommissionWithdrawal,
        getCommissionWallet,
        // Sprint 6: SAK Reporting & Oriental Learn
        courses,
        workshops,
        certificates,
        submitQuizAttempt,
        registerWorkshopAttendee,
        exportFinancialStatementDoc,
        // Sprint 7: Loyalty Tiers, Closed-Loop Oriental Pay & Waste Claims
        payWithOrientalPay,
        topUpOrientalPay,
        evaluateMemberTier,
        wasteSettlementClaims,
        generateWasteSettlementClaim,
        influencerLinks,
        generateInfluencerLink,
        // Sprint 7: PWA Offline-First & Dexie Sync Engine
        isOfflineSimulated,
        setIsOfflineSimulated,
        isNetworkOnline,
        isEffectiveOnline,
        pendingOfflineCount,
        pendingOfflineTransactions,
        triggerSyncOfflineBatch,
        recentSyncLogs,
        refreshPendingSync,
        // Sprint 8: Multi-Outlet & Governance
        outletsList,
        activeOutletId,
        activeOutlet,
        setActiveOutletId,
        toggleOutletBusinessLine,
        stockTransfers,
        createStockTransfer,
        dispatchStockTransfer,
        receiveStockTransfer,
        cancelStockTransfer,
        branchPriceProposals,
        submitBranchPriceProposal,
        reviewBranchPriceProposal,
        finalizeBranchPriceProposal,
        // Sprint 9: 7 Operational Reports, TOP Credit Plafon & Flexible Price List Engine
        dailySalesReport,
        cashierShiftReports,
        paymentMethodBreakdown,
        outletSummaries,
        fastMovingProducts,
        periodRevenueReports,
        voidAuditRecords,
        productSegmentPrices,
        addProductSegmentPrice,
        updateProductSegmentPrice,
        deleteProductSegmentPrice,
        recordVoidTransaction,
        reconcileCashierShift,
        checkMemberTopCreditStatus,
        settleMemberReceivable,
      }}
    >
      {children}
    </EcosystemContext.Provider>
  );
};


export const useEcosystem = () => {
  const context = useContext(EcosystemContext);
  if (!context) {
    throw new Error('useEcosystem must be used within an EcosystemProvider');
  }
  return context;
};
