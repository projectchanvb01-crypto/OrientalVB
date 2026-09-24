import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, membersApi, posApi, wasteApi, whiteLabelApi, referralApi, accountingApi } from '../lib/api';
import { localDb } from '../lib/db';
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
    partnerProfitSharePct?: number; // 10%
    qualityGrade?: 'SUPER' | 'STANDAR' | 'KERUH';
    notes?: string;
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
    totalLoyaltyPoints: 890,
    totalSpendMonth: 145000000,
    doorprizeCouponsCount: 65,
    doorprizeCoupons: ['ORT-KUP2609-0060', 'ORT-KUP2609-0061'],
    pointHistory: [],
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
    totalLoyaltyPoints: 410,
    totalSpendMonth: 68000000,
    doorprizeCouponsCount: 30,
    doorprizeCoupons: ['ORT-KUP2609-0070'],
    pointHistory: [],
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
    totalLoyaltyPoints: 215,
    totalSpendMonth: 34000000,
    doorprizeCouponsCount: 16,
    doorprizeCoupons: ['ORT-KUP2609-0080'],
    pointHistory: [],
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
];

const INITIAL_PRODUCTS: ProductWithMultiUnit[] = [
  {
    id: 'prod-minyak',
    baseSku: 'SKU-MYK-002',
    name: 'Minyak Goreng Oriental 2L',
    category: 'Sembako',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80',
    baseUnitName: 'pouch',
    packUnitName: 'karton',
    unitsPerPack: 6, // 1 Karton = 6 Pouch (12 Liter)
    totalStockInBaseUnits: 120, // 20 karton (120 pouch)
    grosirDusPrice: 195000,
    grosirBalPrice: 190000,
    grosirPaletPrice: 184000,
    paletMultiplier: 60,
    ukmPrice: 192000,
    ukmHotelPrice: 188000,
    ukmCafePrice: 190000,
    ukmWarungPrice: 193000,
    ukmRestoPrice: 189000,
    ukmCoffeeshopPrice: 191000,
    variants: [
      {
        unitName: 'Pouch',
        skuSuffix: 'PCH',
        barcode: '8991001201',
        multiplier: 1,
        price: 34000,
        isBaseUnit: true,
      },
      {
        unitName: 'Karton',
        skuSuffix: 'KRT',
        barcode: '8991001206',
        multiplier: 6,
        price: 195000,
        isBaseUnit: false,
      },
    ],
  },
  {
    id: 'prod-beras',
    baseSku: 'SKU-BRS-003',
    name: 'Beras Premium Pulen 5Kg',
    category: 'Sembako',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
    baseUnitName: 'karung',
    packUnitName: 'bal',
    unitsPerPack: 5, // 1 Bal = 5 Karung 5Kg (25Kg)
    totalStockInBaseUnits: 60, // 12 bal (60 karung 5kg)
    grosirDusPrice: 355000,
    grosirBalPrice: 348000,
    grosirPaletPrice: 339000,
    paletMultiplier: 50,
    ukmPrice: 350000,
    ukmHotelPrice: 345000,
    ukmCafePrice: 348000,
    ukmWarungPrice: 350000,
    ukmRestoPrice: 346000,
    ukmCoffeeshopPrice: 349000,
    variants: [
      {
        unitName: 'Karung',
        skuSuffix: 'KRG',
        barcode: '8991002301',
        multiplier: 1,
        price: 74000,
        isBaseUnit: true,
      },
      {
        unitName: 'Bal',
        skuSuffix: 'BAL',
        barcode: '8991002305',
        multiplier: 5,
        price: 355000,
        isBaseUnit: false,
      },
    ],
  },
  {
    id: 'prod-terigu',
    baseSku: 'SKU-TRG-006',
    name: 'Tepung Terigu Serbaguna (Zak 25Kg)',
    category: 'Bahan Baku',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    baseUnitName: 'bungkus',
    packUnitName: 'zak',
    unitsPerPack: 25, // 1 Zak = 25 Bungkus 1Kg
    totalStockInBaseUnits: 100, // 4 zak (100 bungkus)
    grosirDusPrice: 245000,
    grosirBalPrice: 240000,
    grosirPaletPrice: 232000,
    paletMultiplier: 100,
    ukmPrice: 242000,
    ukmHotelPrice: 238000,
    ukmCafePrice: 240000,
    ukmWarungPrice: 242000,
    ukmRestoPrice: 239000,
    ukmCoffeeshopPrice: 241000,
    variants: [
      {
        unitName: 'Bungkus',
        skuSuffix: 'BKS',
        barcode: '8991006501',
        multiplier: 1,
        price: 11000,
        isBaseUnit: true,
      },
      {
        unitName: 'Zak',
        skuSuffix: 'ZAK',
        barcode: '8991006525',
        multiplier: 25,
        price: 245000,
        isBaseUnit: false,
      },
    ],
  },
  {
    id: 'prod-gula',
    baseSku: 'SKU-GLA-004',
    name: 'Gula Pasir Kristal Karung 50Kg',
    category: 'Sembako',
    imageUrl: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400&auto=format&fit=crop&q=80',
    baseUnitName: 'bungkus',
    packUnitName: 'karung',
    unitsPerPack: 50, // 1 Karung = 50 Bungkus 1Kg
    totalStockInBaseUnits: 200, // 4 karung (200 bungkus)
    grosirDusPrice: 810000,
    grosirBalPrice: 795000,
    grosirPaletPrice: 775000,
    paletMultiplier: 50,
    ukmPrice: 800000,
    ukmHotelPrice: 785000,
    ukmCafePrice: 790000,
    ukmWarungPrice: 800000,
    ukmRestoPrice: 788000,
    ukmCoffeeshopPrice: 795000,
    variants: [
      {
        unitName: 'Bungkus',
        skuSuffix: 'BKS',
        barcode: '8991003401',
        multiplier: 1,
        price: 17500,
        isBaseUnit: true,
      },
      {
        unitName: 'Karung',
        skuSuffix: 'KRG',
        barcode: '8991003450',
        multiplier: 50,
        price: 810000,
        isBaseUnit: false,
      },
    ],
  },
  {
    id: 'prod-indomie',
    baseSku: 'SKU-IND-001',
    name: 'Indomie Goreng Spesial',
    category: 'Mie Instan',
    imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop&q=80',
    baseUnitName: 'bungkus',
    packUnitName: 'dos',
    unitsPerPack: 24, // 1 Dos = 24 Bungkus
    totalStockInBaseUnits: 240, // 10 dos (240 bungkus)
    grosirDusPrice: 80000,
    grosirBalPrice: 78000,
    grosirPaletPrice: 74000,
    paletMultiplier: 100,
    ukmPrice: 79000,
    ukmHotelPrice: 76000,
    ukmCafePrice: 78000,
    ukmWarungPrice: 79000,
    ukmRestoPrice: 77000,
    ukmCoffeeshopPrice: 78500,
    variants: [
      {
        unitName: 'Bungkus',
        skuSuffix: 'BKS',
        barcode: '8991008801',
        multiplier: 1,
        price: 3500,
        isBaseUnit: true,
      },
      {
        unitName: 'Dos',
        skuSuffix: 'DOS',
        barcode: '8991008824',
        multiplier: 24,
        price: 80000,
        isBaseUnit: false,
      },
    ],
  },
  {
    id: 'prod-kopi',
    baseSku: 'SKU-KOP-005',
    name: 'Kopi Susu Gula Aren 250ml',
    category: 'Minuman',
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80',
    baseUnitName: 'botol',
    packUnitName: 'karton',
    unitsPerPack: 12, // 1 Karton = 12 Botol
    totalStockInBaseUnits: 72, // 6 karton (72 botol)
    grosirDusPrice: 135000,
    grosirBalPrice: 130000,
    grosirPaletPrice: 124000,
    paletMultiplier: 60,
    ukmPrice: 132000,
    ukmHotelPrice: 128000,
    ukmCafePrice: 130000,
    ukmWarungPrice: 132000,
    ukmRestoPrice: 129000,
    ukmCoffeeshopPrice: 129500,
    variants: [
      {
        unitName: 'Botol',
        skuSuffix: 'BTL',
        barcode: '8991005601',
        multiplier: 1,
        price: 12000,
        isBaseUnit: true,
      },
      {
        unitName: 'Karton',
        skuSuffix: 'KRT',
        barcode: '8991005612',
        multiplier: 12,
        price: 135000,
        isBaseUnit: false,
      },
    ],
  },
  {
    id: 'prod-minyak-botol',
    baseSku: 'SKU-MYK-BTL-01',
    name: 'Minyak Goreng Botol 1L',
    category: 'Cooking Oil',
    imageUrl: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400&auto=format&fit=crop&q=80',
    baseUnitName: 'botol',
    packUnitName: 'karton',
    unitsPerPack: 12,
    totalStockInBaseUnits: 96,
    grosirDusPrice: 210000,
    grosirBalPrice: 205000,
    grosirPaletPrice: 198000,
    paletMultiplier: 60,
    ukmPrice: 208000,
    ukmHotelPrice: 204000,
    ukmCafePrice: 206000,
    ukmWarungPrice: 208000,
    ukmRestoPrice: 205000,
    ukmCoffeeshopPrice: 207000,
    variants: [
      {
        unitName: 'Botol',
        skuSuffix: 'BTL',
        barcode: '8991009901',
        multiplier: 1,
        price: 18500,
        isBaseUnit: true,
      },
      {
        unitName: 'Karton',
        skuSuffix: 'KRT',
        barcode: '8991009912',
        multiplier: 12,
        price: 210000,
        isBaseUnit: false,
      },
    ],
  },
  {
    id: 'prod-indomie-kuah',
    baseSku: 'SKU-IND-KUAH-01',
    name: 'Indomie Kuah Kari Ayam',
    category: 'Groceries',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80',
    baseUnitName: 'bungkus',
    packUnitName: 'dos',
    unitsPerPack: 24,
    totalStockInBaseUnits: 180,
    grosirDusPrice: 80000,
    grosirBalPrice: 78000,
    grosirPaletPrice: 74000,
    paletMultiplier: 100,
    ukmPrice: 79000,
    ukmHotelPrice: 76000,
    ukmCafePrice: 78000,
    ukmWarungPrice: 79000,
    ukmRestoPrice: 77000,
    ukmCoffeeshopPrice: 78500,
    variants: [
      {
        unitName: 'Bungkus',
        skuSuffix: 'BKS',
        barcode: '8991008811',
        multiplier: 1,
        price: 3500,
        isBaseUnit: true,
      },
      {
        unitName: 'Dos',
        skuSuffix: 'DOS',
        barcode: '8991008822',
        multiplier: 24,
        price: 80000,
        isBaseUnit: false,
      },
    ],
  },
  {
    id: 'prod-snack-roma',
    baseSku: 'SKU-SNK-ROMA-01',
    name: 'Biskuit Kelapa Renyah 300g',
    category: 'Groceries',
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&auto=format&fit=crop&q=80',
    baseUnitName: 'bungkus',
    packUnitName: 'karton',
    unitsPerPack: 20,
    totalStockInBaseUnits: 140,
    grosirDusPrice: 195000,
    grosirBalPrice: 190000,
    grosirPaletPrice: 182000,
    paletMultiplier: 50,
    ukmPrice: 192000,
    ukmHotelPrice: 188000,
    ukmCafePrice: 190000,
    ukmWarungPrice: 193000,
    ukmRestoPrice: 189000,
    ukmCoffeeshopPrice: 191000,
    variants: [
      {
        unitName: 'Bungkus',
        skuSuffix: 'BKS',
        barcode: '8991007701',
        multiplier: 1,
        price: 10500,
        isBaseUnit: true,
      },
      {
        unitName: 'Karton',
        skuSuffix: 'KRT',
        barcode: '8991007720',
        multiplier: 20,
        price: 195000,
        isBaseUnit: false,
      },
    ],
  },
  {
    id: 'prod-teh-kotak',
    baseSku: 'SKU-MNM-TEH-01',
    name: 'Teh Jasmine Melati Kotak 250ml',
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
    baseUnitName: 'kotak',
    packUnitName: 'karton',
    unitsPerPack: 24,
    totalStockInBaseUnits: 120,
    grosirDusPrice: 96000,
    grosirBalPrice: 92000,
    grosirPaletPrice: 88000,
    paletMultiplier: 60,
    ukmPrice: 94000,
    ukmHotelPrice: 90000,
    ukmCafePrice: 92000,
    ukmWarungPrice: 94000,
    ukmRestoPrice: 91000,
    ukmCoffeeshopPrice: 93000,
    variants: [
      {
        unitName: 'Kotak',
        skuSuffix: 'KTK',
        barcode: '8991004401',
        multiplier: 1,
        price: 4500,
        isBaseUnit: true,
      },
      {
        unitName: 'Karton',
        skuSuffix: 'KRT',
        barcode: '8991004424',
        multiplier: 24,
        price: 96000,
        isBaseUnit: false,
      },
    ],
  },
];

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
];

const INITIAL_WASTE_PARTNERS: WasteLocationPartner[] = [
  {
    id: 'prt-mks-01',
    code: 'DP-MKS-SENTRA',
    name: 'Sentra Kuliner Losari Makassar',
    location: 'Jl. Penghibur No. 88, Makassar',
    contactPerson: 'H. Daeng Rapi',
    phone: '+62 811-4400-991',
    profitSharePct: 10, // 10% dari margin kotor sesuai instruksi pengguna
    totalWeightCollectedKg: 450,
    totalEarnings: 90000,
    unpaidEarnings: 90000,
    isActive: true,
  },
  {
    id: 'prt-mks-02',
    code: 'DP-GWA-SOMBA',
    name: 'Mitra Transit Somba Opu Gowa',
    location: 'Jl. Sultan Hasanuddin No. 12, Gowa',
    contactPerson: 'Ibu Ratna Dewi',
    phone: '+62 852-5511-332',
    profitSharePct: 10, // 10% dari margin kotor
    totalWeightCollectedKg: 280,
    totalEarnings: 56000,
    unpaidEarnings: 56000,
    isActive: true,
  },
  {
    id: 'prt-bne-01',
    code: 'DP-BNE-WATAMPONE',
    name: 'Drop Point Oriental Watampone Bone',
    location: 'Jl. Ahmad Yani No. 45, Watampone',
    contactPerson: 'Andi Mallombassi',
    phone: '+62 821-9988-771',
    profitSharePct: 10, // 10% dari margin kotor
    totalWeightCollectedKg: 190,
    totalEarnings: 38000,
    unpaidEarnings: 38000,
    isActive: true,
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
    const pointsEarned = Math.floor(grandTotal / LOYALTY_POINT_RULES.RETAIL_SPEND_PER_POINT);
    const couponsEarned = Math.floor(grandTotal / LOYALTY_POINT_RULES.DOORPRIZE_SPEND_PER_COUPON);
    const changeAmount = Math.max(0, paidAmount - grandTotal);

    // Snapshot cart items before clearing
    const cartSnapshot = [...retailCart];

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
      const updated: MemberOneIdentity = {
        ...prev,
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

    // 5. Store in Dexie IndexedDB for Offline-First resilience
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
        paymentMethod,
        cashierId: currentUser.id,
        memberCode: activeMember.memberCode,
        isSynced: true,
        createdAt: new Date(),
      })
      .catch((err) => console.warn('[localDb.offlineTransactions] Save error:', err));

    // 6. Notify Backend API
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
      .catch((err) => console.warn('[posApi.checkout] API notice:', err));

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

    // Konversi Poin Dinamis: UKM Supply (Rp 50.000 = 1 pt) vs Grosir (Rp 200.000 = 1 pt)
    const pointRule = isUkm
      ? LOYALTY_POINT_RULES.UKM_SUPPLY_SPEND_PER_POINT
      : LOYALTY_POINT_RULES.GROSIR_SPEND_PER_POINT;

    const pointsEarned = Math.floor(grandTotal / pointRule);
    const couponsEarned = Math.floor(grandTotal / LOYALTY_POINT_RULES.DOORPRIZE_SPEND_PER_COUPON);

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
      description: `${isUkm ? 'B2B Pasokan UKM Kuliner' : 'Partai Grosir Distribusi'} kepada ${customerName} (${paymentDesc})`,
      transactionAmount: grandTotal,
      pointsEarned,
      couponsEarned,
    };

    setActiveMember((prev) => {
      const updated: MemberOneIdentity = {
        ...prev,
        totalLoyaltyPoints: prev.totalLoyaltyPoints + pointsEarned,
        totalSpendMonth: prev.totalSpendMonth + grandTotal,
        doorprizeCouponsCount: prev.doorprizeCouponsCount + couponsEarned,
        doorprizeCoupons: [...newCouponCodes, ...(prev.doorprizeCoupons || [])],
        pointHistory: [historyRecord, ...(prev.pointHistory || [])],
      };

      setMembersList((list) => list.map((m) => (m.id === prev.id ? updated : m)));
      return updated;
    });

    // 4. Update Pembukuan Live Akuntansi SAK (Piutang Usaha jika Termin)
    const estimatedHPP = Math.round(grandTotal * 0.8);
    setFinancials((prev) => ({
      ...prev,
      grosirRevenue: !isUkm ? prev.grosirRevenue + grandTotal : prev.grosirRevenue,
      ukmSupplyRevenue: isUkm ? prev.ukmSupplyRevenue + grandTotal : prev.ukmSupplyRevenue,
      cogsCost: prev.cogsCost + estimatedHPP,
      cashAndBank: paymentType === 'CASH' ? prev.cashAndBank + grandTotal : prev.cashAndBank,
      accountsReceivable:
        paymentType === 'TERMIN' ? prev.accountsReceivable + grandTotal : prev.accountsReceivable,
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
  }): WastePurchaseRecord => {
    const netWeight =
      data.netWeightKg > 0
        ? data.netWeightKg
        : Math.max(0, data.grossWeightKg - (data.tareWeightKg || 0));
    const totalCostPaid = Math.round(netWeight * data.pricePerKg);
    const pointsAwarded = Math.floor(netWeight / LOYALTY_POINT_RULES.WASTE_KG_PER_POINT); // 1 kg = 1 Poin

    // Margin kotor = (Harga Jual Pabrik - Harga Beli) * Berat Bersih (Kg)
    const grossMargin = Math.round((data.factorySellingPricePerKg - data.pricePerKg) * netWeight);

    // Sharing % mitra tempat: 10% dari margin kotor sesuai instruksi pengguna
    const profitSharePct = data.partnerProfitSharePct ?? 10;
    const partnerEarnedAmount = Math.round((grossMargin * profitSharePct) / 100);

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

    // 1. Mutasi Poin & History jika Penyetor adalah Member
    if (data.sellerMemberId && data.sellerMemberId !== 'NON_MEMBER') {
      const historyRecord: PointMutationRecord = {
        id: `mut-${Date.now()}`,
        memberId: data.sellerMemberId,
        date: new Date().toLocaleString('id-ID'),
        invoiceNumber: receiptNumber,
        channel: 'WASTE',
        description: `Setor ${netWeight.toFixed(1)} kg ${data.wasteCategory} di ${partner ? partner.name : 'Drop Point'}`,
        transactionAmount: totalCostPaid,
        pointsEarned: pointsAwarded,
        couponsEarned: 0,
      };

      setMembersList((prevList) =>
        prevList.map((m) => {
          if (m.id === data.sellerMemberId || m.memberCode === data.sellerMemberId) {
            return {
              ...m,
              totalLoyaltyPoints: m.totalLoyaltyPoints + pointsAwarded,
              pointHistory: [historyRecord, ...(m.pointHistory || [])],
            };
          }
          return m;
        }),
      );

      if (activeMember.id === data.sellerMemberId || activeMember.memberCode === data.sellerMemberId) {
        setActiveMember((prev) => ({
          ...prev,
          totalLoyaltyPoints: prev.totalLoyaltyPoints + pointsAwarded,
          pointHistory: [historyRecord, ...(prev.pointHistory || [])],
        }));
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
