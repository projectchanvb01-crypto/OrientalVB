/**
 * Oriental Digital Ecosystem - Shared Type Definitions & Contracts
 */

// ==========================================
// 1. User & Multi-tier RBAC Delegation
// ==========================================
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',         // Business Owner
  REGIONAL_MANAGER = 'REGIONAL_MANAGER', // Regional Manager / Wilayah (§8 Addendum)
  ADMIN_MANAGER = 'ADMIN_MANAGER',     // Business Manager / PIC
  ADMIN_PURCHASING = 'ADMIN_PURCHASING', // Purchasing / Pengadaan
  ADMIN_KASIR = 'ADMIN_KASIR',         // Cashier (Strictly isolated)
  OPERATOR_WASTE = 'OPERATOR_WASTE',   // Reverse logistics & drop point operator
  STAFF_GUDANG = 'STAFF_GUDANG',       // Warehouse & stock checker
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  tenantId: string;
  delegatedById?: string; // ID of the user who delegated this account
  delegatedByName?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface DelegateUserDto {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
}

// ==========================================
// 2. Member One Identity & CRM (Sesuai Template Form Costumer One Identity)
// ==========================================
export enum RegionCode {
  MAKASSAR = '101',    // Mks
  WATAMPONE = '102',   // Bone
}

export enum CustomerSegment {
  B2C_RETAIL = 'B2C_RETAIL',
  B2B_GROSIR = 'B2B_GROSIR',
  B2B_HOTEL = 'B2B_HOTEL',
  B2B_CAFE = 'B2B_CAFE',
  B2B_WARUNG = 'B2B_WARUNG',
  B2B_COFFEESHOP = 'B2B_COFFEESHOP',
  B2B_TENANT = 'B2B_TENANT',
  B2B_TOKO = 'B2B_TOKO',
  B2B_PREORDER = 'B2B_PREORDER',
  B2B_RESTAURANT = 'B2B_RESTAURANT',
  MITRA_WASTE = 'MITRA_WASTE',
  MITRA_WHITE_LABEL = 'MITRA_WHITE_LABEL',
}

export interface MemberBusinessProfile {
  businessIndex: number; // 1, 2, 3
  businessCode: string;  // e.g. 102-260820-01-01-100 (UKM Supply) atau 900 (Grosir)
  businessName: string;
  businessType: string;  // Hotel, Café, Warung, Coffee Shop, Tenant, Toko, Preorder, Lainnya
  businessLocation: string;
  picName: string;
  picRole: string;       // Jabatan PIC
  picWhatsapp: string;
  socialMedia?: string;
  businessDescription?: string;
  businessModel: 'Single Ownership' | 'Product Distribution Franchise' | 'Business Format Franchise' | string;
  featuredProducts?: string[]; // Chinese Food, Indonesian Food, Pastry, Signature Coffee, Non-Coffee, Roti & Bakery, dll.
}

export interface MemberSurveyData {
  outletCount: number;
  monthlySpendEstimate: string; // < Rp 8 Jt, Rp 8-15 Jt, Rp 15-30 Jt, Rp 30-50 Jt, Rp 50-80 Jt, Rp 80-120 Jt, Rp 120-150 Jt, > Rp 150 Jt
  mainRawMaterials: string[];  // Frozen Food Olahan, Bahan Masakan, Bahan Minuman, Kemasan Plastik, Bumbu Dapur, Daging Fresh, Frozen Daging, Sayur & Buah Segar, Sayur & Buah Beku, Cemilan Instan
  posUsage: 'Pakai' | 'Sedang bertimbang untuk pakai' | 'Tidak pakai';
  managementStructure: 'Ada Divisi (Keuangan/Pajak/Operasional)' | 'Tidak ada, saya mengelola Sendiri';
  businessGoals: string[];     // Buka Cabang, Tambah Bisnis, Perbaiki Management, Penambahan Menu
}

export interface PointMutationRecord {
  id: string;
  memberId: string;
  date: string;
  invoiceNumber: string;
  channel: 'RETAIL' | 'GROSIR' | 'UKM_SUPPLY' | 'WASTE' | 'WHITE_LABEL';
  description: string;
  transactionAmount: number;
  pointsEarned: number;
  couponsEarned: number;
}

export enum CustomerTier {
  REGULER = 'REGULER',     // < Rp 10 Juta / bln (Default)
  BRONZE = 'BRONZE',       // Rp 10 Jt - Rp 20 Jt / bln
  SILVER = 'SILVER',       // Rp 20 Jt - Rp 40 Jt / bln
  GOLD = 'GOLD',           // Rp 40 Jt - Rp 70 Jt / bln (+10% Poin)
  PLATINUM = 'PLATINUM',   // > Rp 70 Jt / bln (Diskon Ekstra 1% & +15% Poin)
}

export interface OrientalPayTransactionRecord {
  id: string;
  memberId?: string;
  date?: string;
  type: 'CREDIT' | 'DEBIT' | 'REFERRAL_COMMISSION' | 'WASTE_PAYOUT' | 'TOPUP' | 'PURCHASE_PAYMENT';
  amount: number;
  source?: 'REFERRAL_COMMISSION' | 'CASHBACK' | 'WASTE_PAYMENT' | 'PURCHASE_PAYMENT' | 'INITIAL_CREDIT';
  description: string;
  channel?: string;
  referenceId?: string;
  referenceInvoice?: string;
  balanceAfter: number;
  createdAt?: string;
}

export interface MemberOneIdentity {
  id: string;
  memberCode: string;      // Format standar: daerah - YYMMDD - Urutan (e.g. 102-260820-01)
  barcode: string;         // Barcode kartu fisik (e.g. 82000080)
  fullName: string;        // Nama Lengkap Pemilik
  nik?: string;            // Nomor KTP (NIK)
  phone: string;           // Nomor Whatsapp Aktif (+62 8...)
  birthDate?: string;      // Tanggal Lahir
  gender?: 'Pria' | 'Wanita';
  email?: string;          // Alamat E-Mail aktif
  address?: string;        // Alamat Domisili
  regionCode: RegionCode | string;
  segment: CustomerSegment;
  businessName?: string;
  businessProfiles?: MemberBusinessProfile[];
  surveyData?: MemberSurveyData;
  totalLoyaltyPoints: number;
  totalSpendMonth: number;
  doorprizeCouponsCount: number;
  doorprizeCoupons?: string[]; // Array nomor kupon undian aktif (e.g. DPZ-202609-001)
  pointHistory?: PointMutationRecord[];
  
  // Sprint 7 Additions: Customer Tier & Closed-Loop Oriental Pay
  currentTier?: CustomerTier;
  rolling3MonthAvgSpend?: number;
  monthlySpendsRecent?: number[]; // [Month-1, Month-2, Month-3]
  tierEvaluatedAt?: string;
  tierExpiresAt?: string;
  downgradeWarning?: boolean;
  orientalPayBalance?: number; // Saldo dompet tertutup (closed-loop)
  orientalPayHistory?: OrientalPayTransactionRecord[];
  influencerAffiliateCode?: string;

  // Sprint 9 Additions: TOP Credit Plafon & Overdue Lock (PRD §8.1 & §2.5)
  creditLimit?: number;                  // Plafon kredit B2B TOP (Rupiah)
  currentOutstandingReceivables?: number; // Total piutang berjalan belum lunas
  hasOverdueInvoices?: boolean;           // Ada faktur yang melewati jatuh tempo
  overdueInvoiceNumbers?: string[];       // Rincian nomor faktur tertunggak
  topAllowedDays?: number;               // Tenor TOP maksimal yang disetujui (7, 14, 30)

  isActive: boolean;
  registeredAt: Date;
}

export interface RegisterMemberDto {
  regionCode: RegionCode | string; // '101' (Makassar) atau '102' (Watampone)
  fullName: string;
  nik?: string;
  phone: string;
  birthDate?: string;
  gender?: 'Pria' | 'Wanita';
  email?: string;
  address?: string;
  segment: CustomerSegment;
  businessName?: string;
  businessType?: string;
  businessLocation?: string;
  picName?: string;
  picRole?: string;
  picWhatsapp?: string;
  socialMedia?: string;
  businessModel?: string;
  featuredProducts?: string[];
  outletCount?: number;
  monthlySpendEstimate?: string;
  mainRawMaterials?: string[];
  posUsage?: 'Pakai' | 'Sedang bertimbang untuk pakai' | 'Tidak pakai';
  managementStructure?: string;
  businessGoals?: string[];
}

// ==========================================
// 3. Loyalty & Doorprize Engine Rules (Sesuai Master format Penomoran Kupon Undian.md)
// ==========================================
export const LOYALTY_POINT_RULES = {
  RETAIL_SPEND_PER_POINT: 100000,       // Rp 100.000 = 1 point
  UKM_SUPPLY_SPEND_PER_POINT: 50000,    // Rp 50.000 = 1 point
  GROSIR_SPEND_PER_POINT: 200000,       // Rp 200.000 = 1 point
  WASTE_KG_PER_POINT: 1,                // 1 kg = 1 point
  WHITE_LABEL_SPEND_PER_POINT: 10000,   // Rp 10.000 = 1 point
  DOORPRIZE_SPEND_PER_COUPON: 150000,   // Rp 150.000 = 1 coupon
  DOORPRIZE_MONTHLY_LIMIT: 2500,        // 1 bulan maksimal 2500 lembar, jika lebih dialihkan ke bulan berikutnya
} as const;

/**
 * Format Kupon Standar Resmi: ORT-KUPYYMM-urutan(4 DIGIT)
 * - ORT: Singkatan dari Oriental
 * - KUP: Singkatan dari Kupon
 * - YY: Tahun terbit (2 digit, misal 26)
 * - MM: Bulan terbit (2 digit, misal 08, 09)
 * - urutan: 0001 hingga 2500
 */
export function formatDoorprizeCouponNumber(yearYY: string, monthMM: string, sequence: number): string {
  const paddedSeq = String(sequence).padStart(4, '0');
  return `ORT-KUP${yearYY}${monthMM}-${paddedSeq}`;
}

export interface DoorprizeCoupon {
  id: string;
  couponNumber: string; // Format: ORT-KUPYYMM-urutan (e.g. ORT-KUP2609-0001)
  memberId: string;
  memberCode: string;
  memberName: string;
  barcode: string;
  phone: string;
  address?: string;
  invoiceNumber: string;
  periodLabel: string; // e.g. "01 SEPT 2026 - 30 SEPT 2027"
  isDrawn: boolean;
  issuedAt: Date;
}

// ==========================================
// 4. Products & Multi-Tier Pricing
// ==========================================
export interface ProductPriceTier {
  retailPrice: number;
  grosirDusPrice: number;
  grosirBalPrice?: number;
  ukmHotelPrice: number;
  ukmCafePrice: number;
  ukmWarungPrice: number;
  ukmCoffeeshopPrice: number;
  ukmRestoPrice: number;
}

export interface ProductUnitVariant {
  unitName: string; // e.g. 'Bungkus' (satuan dasar) atau 'Dos' (satuan pack)
  skuSuffix: string; // e.g. 'BKS', 'DOS'
  barcode: string; // Barcode turunan per varian unit
  multiplier: number; // 1 untuk bungkus, 24 untuk 1 dos
  price: number;
  isBaseUnit?: boolean;
}

export interface ProductWithMultiUnit {
  id: string;
  baseSku: string;
  name: string;
  category: string;
  imageUrl?: string;
  baseUnitName: string; // 'Bungkus', 'Pouch', 'Botol', 'Karung'
  packUnitName: string; // 'Dos', 'Karton', 'Bal', 'Zak'
  unitsPerPack: number; // e.g. 24 bungkus per 1 dos
  totalStockInBaseUnits: number; // Total persediaan dalam satuan terkecil (single source of truth)
  variants: ProductUnitVariant[];
  grosirDusPrice?: number;
  grosirBalPrice?: number;
  grosirPaletPrice?: number;
  ukmPrice?: number;
  ukmHotelPrice?: number;
  ukmCafePrice?: number;
  ukmWarungPrice?: number;
  ukmRestoPrice?: number;
  ukmCoffeeshopPrice?: number;
  balMultiplier?: number; // e.g. 1 bal = multiple packs
  paletMultiplier?: number; // e.g. 1 palet = multiple dus (e.g. 20-40 dus)

  // Sprint 7 Additions: Maklon End-Customer Tracking
  maklonPartnerId?: string; // ID of White Label / Maklon partner
  isMaklonProduct?: boolean; // If true, earns 1 point per Rp 10.000 instead of Rp 100.000

  // Sprint 9 Additions: Flexible Segment Price List Engine (PRD Addendum §10)
  segmentPrices?: ProductSegmentPrice[];
}

export interface B2BOrderItem {
  productId: string;
  productName: string;
  unit: string;
  multiplier: number; // jumlah base unit per pack
  unitPrice: number;
  quantity: number;
  tier: 'DUS' | 'BAL' | 'PALET' | 'UKM';
  subtotal: number;
}

export function getB2BChannelFromBusinessCode(businessCode?: string, businessType?: string): 'UKM_SUPPLY' | 'GROSIR' {
  if (businessCode?.endsWith('-900') || (businessType && businessType.toLowerCase().includes('grosir'))) {
    return 'GROSIR';
  }
  return 'UKM_SUPPLY';
}


export interface ProductItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  unit: string; // Pcs, Dus, Bal, Kg, Liter
  stockQty: number;
  bufferStockMin: number;
  hppCost: number; // Recipe cost / modal
  prices: ProductPriceTier;
  isActive: boolean;
}

// ==========================================
// 5. Transactions & Point of Sale (POS)
// ==========================================
export enum TransactionType {
  RETAIL_B2C = 'RETAIL_B2C',
  GROSIR_B2B = 'GROSIR_B2B',
  UKM_SUPPLY = 'UKM_SUPPLY',
  WASTE_PURCHASE = 'WASTE_PURCHASE',
  WHITE_LABEL = 'WHITE_LABEL',
}

export enum PaymentMethod {
  CASH = 'CASH',
  QRIS_DYNAMIC = 'QRIS_DYNAMIC',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DEBIT_CREDIT = 'DEBIT_CREDIT',
  TERMS_OF_PAYMENT = 'TERMS_OF_PAYMENT', // TOP for B2B
  ORIENTAL_PAY = 'ORIENTAL_PAY',         // Closed-loop internal e-wallet (Sprint 7)
}

export interface CartItem {
  productId: string;
  productName: string;
  barcode: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  subtotal: number;
}

export interface PosOrderCheckout {
  id?: string;
  invoiceNumber: string;
  transactionType: TransactionType;
  cashierId: string;
  memberId?: string;
  items: CartItem[];
  subtotal: number;
  totalDiscount: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  topDays?: number;
  dueDate?: string;
  customerName?: string;
  channel?: string;
  pointsEarned: number;
  couponsEarned: number;
  printedNotaCopies: number; // 1 for retail thermal, 3 for Grosir dot-matrix
  createdAt: Date;
}

// ==========================================
// 6. Waste Purchasing & Profit Sharing
// ==========================================
export interface WasteLocationPartner {
  id: string;
  code: string;
  name: string;
  location: string;
  contactPerson: string;
  phone: string;
  profitSharePct: number; // Standard 10% dari margin kotor
  totalWeightCollectedKg: number;
  totalEarnings: number;
  unpaidEarnings: number;
  isActive: boolean;
}

export interface WasteCategoryRate {
  id: string;
  code: string;
  name: string;
  unit: string; // 'kg'
  buyingPricePerKg: number; // e.g. Rp 7.500/kg
  factorySellingPricePerKg: number; // e.g. Rp 9.500/kg
  description: string;
  minQualityNotes: string;
  isActive: boolean;
  isComingSoon?: boolean;
}

export interface WastePurchaseRecord {
  id: string;
  receiptNumber: string;
  sellerMemberId: string;
  sellerName: string;
  operatorId: string;
  locationPartnerId: string; // Penyedia tempat / drop point
  locationPartnerName: string;
  wasteCategory: string;     // Minyak Jelantah (UCO)
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  pricePerKg: number;
  factorySellingPricePerKg: number;
  totalCostPaid: number;
  grossMargin: number;
  partnerProfitSharePct: number; // 5% flat dari harga beli
  partnerEarnedAmount: number;
  pointsAwarded: number; // 1 kg = 1 Poin
  qualityGrade: 'SUPER' | 'STANDAR' | 'KERUH';
  notes?: string;
  createdAt: Date;
}

export interface WastePartnerSettlementClaim {
  id: string;
  claimNumber: string;
  partnerId: string;
  partnerName: string;
  periodLabel?: string;
  periodMonth?: string;
  totalKgCollected: number;
  totalCustomerPaid?: number;
  totalCustomerPayout?: number;
  profitShareRatePct?: number; // 5% flat (Addendum v2.1)
  profitSharePct?: number;
  settlementAmount?: number;   // totalCustomerPaid * 0.05
  claimAmount?: number;
  status: 'PENDING_MANUAL_TRANSFER' | 'TRANSFERRED' | 'CANCELLED' | 'APPROVED' | 'PAID';
  proofDocumentUrl?: string;
  settledAt?: string;
  settledBy?: string;
  notes?: string;
  generatedAt?: Date;
}

// ==========================================
// 6.1 White Label Production & B2B Supply
// ==========================================
export interface WhiteLabelVendor {
  id: string;
  code: string;
  vendorName: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: string;
  pirtNumber?: string;
  bpomNumber?: string;
  halalCertNumber?: string;
  qcSlaStandard: string;
  category: string; // Bakery, Saus, Minyak, Frozen Food
  memberId?: string;
  isActive: boolean;
}

export interface WhiteLabelContract {
  id: string;
  contractNumber: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  brandName: string; // Custom brand name (e.g. "Roti Manis Oriental Bakery")
  targetQuantity: number;
  unit: string;
  productionCostPerUnit: number; // HPP dari pabrik mitra
  sellingPriceToB2B: number; // Harga jual ke Cafe/Resto B2B
  totalContractValue: number;
  status: 'DRAFT' | 'ACTIVE' | 'FULFILLED' | 'CANCELLED';
  startDate: string;
  endDate: string;
}

export interface WhiteLabelBatchReceipt {
  id: string;
  receiptNumber: string; // GRN-xxx
  contractId: string;
  contractNumber: string;
  vendorId: string;
  vendorName: string;
  productName: string;
  batchNumber: string;
  receivedQuantity: number;
  unit: string;
  costPerUnit: number;
  totalValue: number;
  qcPassed: boolean;
  qcNotes: string;
  receivedDate: string;
}

export interface WhiteLabelProductItem {
  id: string;
  contractId: string;
  vendorId: string;
  vendorName: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  priceToB2B: number; // Harga per satuan
  stockAvailable: number;
  image?: string;
  description: string;
}

export interface WhiteLabelB2BOrder {
  id: string;
  orderNumber: string;
  customerMemberId: string;
  customerName: string;
  customerSegment: string; // Cafe, Resto, Hotel, Warung
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  pointsAwarded: number; // Aturan Khusus B2B UKM Supply: Rp 10.000 = 1 Poin
  orderDate: string;
  status: 'PENDING' | 'PROCESSED' | 'DELIVERED';
}

// ==========================================
// 6.2 Ecosystem Pillars for Segmented Accounting
// ==========================================
export enum EcosystemPillar {
  CONSOLIDATED = 'CONSOLIDATED',
  RETAIL = 'RETAIL',
  GROSIR = 'GROSIR',
  UKM_SUPPLY = 'UKM_SUPPLY',
  WASTE = 'WASTE',
  WHITE_LABEL = 'WHITE_LABEL',
}


// ==========================================
// 7. Referral Engine (Business & Influencer)
// ==========================================
export enum ReferralType {
  BUSINESS = 'BUSINESS',     // 0.5% commission (min 60m own spend, min 30m friend spend)
  INFLUENCER = 'INFLUENCER', // 1.0% commission per link sales
}

export interface ReferralCommission {
  id: string;
  referralType: ReferralType;
  referrerId: string;
  refereeId?: string;
  sourceTransactionId: string;
  transactionAmount: number;
  commissionRatePct: number;
  commissionAmount: number;
  isPaidOut: boolean;
  createdAt: Date;
}

export interface InfluencerProductLink {
  id: string;
  influencerId?: string;
  influencerName?: string;
  memberId?: string;
  affiliateCode?: string;
  productId: string;
  productName: string;
  productPrice?: number;
  referralCode?: string;
  referralUrl?: string;
  shareUrl?: string;
  totalClicks?: number;
  clicksCount?: number;
  totalSalesQty?: number;
  salesCount?: number;
  totalSalesAmount?: number;
  commissionEarned?: number;
  totalCommissionEarned?: number;
  commissionRatePct?: number; // 1.0% flat
  commissionPct?: number;
  createdAt?: string | Date;
}

export interface CommissionWithdrawalRequest {
  id: string;
  requestNumber: string;
  memberId: string;
  memberName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  status: 'PENDING' | 'APPROVED' | 'TRANSFERRED' | 'REJECTED';
  requestedAt: Date;
  processedAt?: Date;
}

export interface StandingOrderItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface StandingOrder {
  id: string;
  orderNumber: string;
  customerMemberId: string;
  customerName: string;
  customerSegment: string;
  deliveryFrequency: 'SETIAP_SENIN' | 'RABU_SABTU' | 'MINGGUAN' | 'DUA_MINGGUAN';
  frequencyLabel: string;
  deliveryTimeSlot: string;
  deliveryAddress: string;
  items: StandingOrderItem[];
  totalAmountPerDelivery: number;
  nextDeliveryDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  createdAt: Date;
}

// ==========================================
// 8. SAK Accounting & Double-Entry Ledger
// ==========================================
export enum AccountCategory {
  ASSET = 'ASSET',             // Aset Lancar & Tetap (1-xxxx)
  LIABILITY = 'LIABILITY',     // Kewajiban / Utang (2-xxxx)
  EQUITY = 'EQUITY',           // Modal & Ekuitas (3-xxxx)
  REVENUE = 'REVENUE',         // Pendapatan Penjualan (4-xxxx)
  COGS = 'COGS',               // Harga Pokok Penjualan / HPP (5-xxxx)
  EXPENSE = 'EXPENSE',         // Beban Operasional / Komisi (6-xxxx)
}

export interface JournalItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: Date;
  referenceType: string; // 'POS_SALE', 'WASTE_BUY', 'COMMISSION_ACCRUAL'
  referenceId: string;
  description: string;
  items: JournalItem[];
  totalDebit: number;
  totalCredit: number; // Must equal totalDebit (Balanced)
}

export interface IncomeStatementSAK {
  title: string;
  period: string;
  revenue: {
    retailSales: number;
    grosirSales: number;
    ukmSupplySales: number;
    whiteLabelSales: number;
    wasteSales: number;
    totalRevenue: number;
  };
  cogs: {
    costOfGoodsSold: number;
    grossProfit: number;
  };
  operatingExpenses: {
    salaries: number;
    referralCommissions: number;
    utilitiesAndRent: number;
    wasteProfitShare: number;
    totalExpenses: number;
  };
  netOperatingProfit: number;
}

export interface BalanceSheetSAK {
  title: string;
  asOfDate: string;
  assets: {
    currentAssets: {
      cashAndBank: number;
      accountsReceivable: number;
      inventoryMerchandise: number;
      inventoryWaste: number;
      totalCurrentAssets: number;
    };
    fixedAssets: {
      equipmentAndVehicles: number;
      accumulatedDepreciation: number;
      netFixedAssets: number;
    };
    totalAssets: number;
  };
  liabilitiesAndEquity: {
    liabilities: {
      accountsPayableVendors: number;
      partnerWasteAccrual: number;
      unpaidReferralCommission: number;
      totalLiabilities: number;
    };
    equity: {
      ownerCapital: number;
      retainedEarnings: number;
      totalEquity: number;
    };
    totalLiabilitiesAndEquity: number;
  };
  isBalanced: boolean;
}

export interface CashFlowStatementSAK {
  title: string;
  period: string;
  operatingActivities: number;
  investingActivities: number;
  financingActivities: number;
  netCashIncrease: number;
  endingCashBalance: number;
}

// ==========================================
// 9. Oriental Learn & UKM Certification (Sprint 6)
// ==========================================
export interface CourseModule {
  id: string;
  title: string;
  category: 'FOOD_COSTING' | 'SANITASI_WASTE' | 'DIGITAL_MARKETING' | 'KEUANGAN_UKM';
  categoryLabel: string;
  description: string;
  durationMinutes: number;
  videoUrl: string;
  thumbnailUrl?: string;
  level: 'Pemula' | 'Menengah' | 'Lanjutan';
  instructor: string;
  instructorRole: string;
  quizQuestions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizSubmissionDto {
  courseId: string;
  memberId: string;
  memberName: string;
  answers: number[]; // index of selected option per question
}

export interface QuizResult {
  courseId: string;
  memberId: string;
  scorePct: number;
  passed: boolean;
  correctAnswersCount: number;
  totalQuestions: number;
  certificate?: DigitalCertificate;
  feedback: string;
}

export interface DigitalCertificate {
  id: string;
  certificateNumber: string;
  memberId: string;
  memberName: string;
  businessName?: string;
  courseTitle: string;
  category: string;
  scorePct: number;
  issueDate: string;
  qrCodeUrl: string;
  verificationHash: string;
}

export interface OfflineWorkshop {
  id: string;
  title: string;
  location: string;
  address: string;
  date: string;
  timeSlot: string;
  instructor: string;
  quota: number;
  registeredCount: number;
  description: string;
  isFull: boolean;
}

export interface WorkshopRegistrationDto {
  workshopId: string;
  memberId: string;
  memberName: string;
  phone: string;
  businessName: string;
}

// ==========================================
// 12. Sprint 8: Multi-Outlet, Stock Transfer & Regional Governance (PRD Addendum §8)
// ==========================================
export interface OutletBusinessLineMatrix {
  hasRetail: boolean;      // Retail Swalayan
  hasGrosir: boolean;      // Grosir Sembako & B2B
  hasUkmSupply: boolean;   // Pasokan Rutin UKM HOREKA
  hasWaste: boolean;       // Penampungan Minyak Jelantah
  hasWhiteLabel: boolean;  // Display & Maklon Produk
}

export interface OutletLocation {
  id: string;              // e.g. 'OUTLET-WATAMPONE-01'
  code: string;            // 'WTP-01'
  name: string;            // 'Oriental Pusat Watampone'
  region: 'WATAMPONE' | 'MAKASSAR' | 'BONESELATAN';
  address: string;
  phone: string;
  managerName: string;
  isHeadquarters: boolean;
  businessLines: OutletBusinessLineMatrix;
  warehouseCapacityCbm: number;
  isActive: boolean;
  openedAt: string;
}

export type TransferStatus = 'DRAFT' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';

export interface InterStoreTransferItem {
  productId: string;
  productName: string;
  variantUnitName: string;
  quantity: number;
  multiplierToBaseUnit: number;
  baseUnitsTotal: number;
}

export interface InterStoreTransferRecord {
  id: string;
  transferNumber: string;        // 'TRF-202609-001'
  sourceOutletId: string;
  sourceOutletName: string;
  targetOutletId: string;
  targetOutletName: string;
  status: TransferStatus;
  items: InterStoreTransferItem[];
  totalBaseUnits: number;
  driverName?: string;
  vehiclePlate?: string;
  notes?: string;
  dispatchedAt?: string;
  receivedAt?: string;
  receivedBy?: string;
  dispatchedBy?: string;
  createdAt: string;
}

export type PriceProposalStatus = 'SUBMITTED' | 'REVIEWED_BY_REGIONAL' | 'APPROVED_BY_OWNER' | 'REJECTED';

export interface ProofAttachment {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface BranchPriceProposal {
  id: string;
  proposalNumber: string;         // 'PRP-202609-001'
  outletId: string;
  outletName: string;
  productId: string;
  productName: string;
  currentPrice: number;
  proposedPrice: number;
  proposalType: 'PRICE_DROP' | 'LOCAL_PROMO';
  reason: string;
  competitorName: string;
  competitorPrice: number;
  proofAttachments: ProofAttachment[]; // Minimum 4 files required by PRD Addendum §8.1
  submittedBy: string;
  submittedAt: string;
  regionalReviewerId?: string;
  regionalReviewNotes?: string;
  regionalReviewedAt?: string;
  ownerReviewerId?: string;
  ownerReviewNotes?: string;
  ownerReviewedAt?: string;
  status: PriceProposalStatus;
}

// ==========================================
// 13. Sprint 9: Flexible Price List Engine & 7 Operational Reports (PRD Addendum §9 & §10)
// ==========================================

export enum PricingSegmentType {
  RETAIL_B2C = 'RETAIL_B2C',
  UKM_KULINER = 'UKM_KULINER',
  GROSIR_AGEN = 'GROSIR_AGEN',
  HOREKA = 'HOREKA',           // Hotel, Restoran, Kafe
  MAKLON_PARTNER = 'MAKLON_PARTNER',
  DISTRIBUTOR = 'DISTRIBUTOR',
}

export interface ProductSegmentPrice {
  id: string;
  productId: string;
  productName?: string;
  segment: PricingSegmentType | string;
  segmentLabel: string;
  minOrderQty: number;
  unit: string;
  baseHpp: number;
  markupPct: number;
  sellingPrice: number;
  effectiveDate: string;
  notes?: string;
  isActive: boolean;
}

// 7 Operational Reports Models (PRD Addendum §9)
export interface DailySalesReportData {
  date: string;
  outletId: string;
  outletName: string;
  grossRevenue: number;
  totalDiscount: number;
  netRevenue: number;
  transactionCount: number;
  averageBasketValue: number;
  totalItemsSold: number;
  transactions: {
    id: string;
    time: string;
    invoiceNumber: string;
    cashierName: string;
    channel: string;
    itemCount: number;
    grandTotal: number;
    paymentMethod: string;
    customerName?: string;
  }[];
}

export interface CashierShiftReportData {
  id: string;
  shiftName: string; // 'Shift 1 (Pagi)' | 'Shift 2 (Siang/Sore)'
  cashierId: string;
  cashierName: string;
  outletName: string;
  openedAt: string;
  closedAt: string;
  openingCash: number;
  cashSalesTotal: number;
  nonCashSalesTotal: number;
  pettyCashExpenses: number;
  expectedCashInDrawer: number;
  actualCashCounted: number;
  difference: number;
  status: 'BALANCED' | 'SHORTAGE' | 'OVERAGE';
  notes?: string;
}

export interface PaymentMethodBreakdownData {
  method: string;
  label: string;
  transactionCount: number;
  totalVolume: number;
  sharePercentage: number;
  badgeColor: string;
}

export interface OutletSummaryReportData {
  outletId: string;
  outletCode: string;
  outletName: string;
  region: string;
  revenue: number;
  grossProfit: number;
  transactionsCount: number;
  activeBusinessLinesCount: number;
  targetRevenue: number;
  achievementPct: number;
  shareOfTotalRevenuePct: number;
}

export interface FastMovingProductData {
  productId: string;
  productName: string;
  category: string;
  unitsSold: number;
  unitName: string;
  totalRevenue: number;
  turnoverRatio: number; // e.g. 8.4x
  velocityGrade: 'FAST_MOVING' | 'NORMAL' | 'SLOW_MOVING';
  stockRemaining: number;
}

export interface PeriodRevenueData {
  periodLabel: string; // e.g. 'Senin 20 Sep', 'Minggu 3', 'September 2026'
  startDate: string;
  endDate: string;
  grossSales: number;
  cogs: number;
  grossMargin: number;
  growthRatePct?: number;
}

export interface VoidAuditRecord {
  id: string;
  invoiceNumber: string;
  originalAmount: number;
  voidReason: string;
  voidedAt: string;
  cashierName: string;
  approvedByManager: string;
  restockedItems: {
    name: string;
    qty: number;
    unit: string;
  }[];
  notes?: string;
}

// ==========================================
// 12. Sprint 8: WMS, FEFO & Landed Cost Types
// ==========================================

export type BatchWarningLevel = 'GREEN' | 'AMBER' | 'RED';

export interface ProductBatch {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  batchNumber: string;
  expiryDate: string; // ISO string YYYY-MM-DD
  stockQty: number;
  costPrice: number;
  warningLevel: BatchWarningLevel;
  daysRemaining: number;
  status: 'ACTIVE' | 'CLEARANCE_PROMO' | 'EXPIRED' | 'DEPLETED';
  receivedDate: string;
  supplierName?: string;
}

export interface DynamicUnitConversion {
  id: string;
  productId: string;
  unitName: string; // e.g. "Dus 24", "Renceng 12", "Bal 10", "Karton 48"
  multiplierQty: number; // e.g. 24, 12, 10, 48 base units
  barcode?: string;
  isDefaultB2b: boolean;
  priceEstimate?: number;
}

export interface SupplierItem {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  locationCity: string; // e.g. "Surabaya", "Jakarta", "Semarang", "Makassar"
  isPkp: boolean;
  npwp?: string;
  leadTimeDays: number;
  rating?: number;
  isActive: boolean;
}

export interface ShippingRouteItem {
  id: string;
  supplierId?: string;
  expeditionName: string; // e.g. "Pelni Logistik", "Meratus Line", "Samudera Indonesia"
  originPort: string; // e.g. "Tanjung Perak (Surabaya)"
  destinationPort: string; // e.g. "Soekarno-Hatta (Makassar)"
  ratePerCbm: number; // Tarif per m3 dalam Rupiah
  minCbm: number; // Minimal kubikasi
  handlingFee: number; // Biaya bongkar muat port
  truckingFee: number; // Biaya trucking darat ke gudang
  estimatedDays: number;
}

export interface LandedCostInput {
  productId?: string;
  productName?: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  unitsPerCarton: number;
  totalCartons: number;
  factoryPricePerUnit: number;
  supplierIsPkp: boolean;
  shippingRouteId: string;
}

export interface LandedCostBreakdown {
  cbmPerCarton: number;
  totalCbm: number;
  totalUnits: number;
  totalFactoryCost: number;
  seaFreightCost: number;
  portHandlingCost: number;
  truckingCost: number;
  totalLogisticsCost: number;
  logisticsCostPerUnit: number;
  ppnMasukanPerUnit: number;
  totalLandedCostPerUnit: number; // Factory + Logistics (+ PPN jika Non-PKP / non-creditable)
  recommendedRetailPrice: number; // With default margin (e.g. 25%)
  recommendedWholesalePrice: number; // With wholesale margin (e.g. 12%)
  estimatedGrossProfitAtRetail: number;
  marginPercentageAtRetail: number;
}

export interface SupplierComparisonItem {
  supplierId: string;
  supplierName: string;
  locationCity: string;
  isPkp: boolean;
  factoryPrice: number;
  routeTitle: string;
  estimatedLeadTime: number;
  logisticsCostPerUnit: number;
  netLandedCostPerUnit: number;
  retailPrice: number;
  marginRp: number;
  marginPct: number;
  isRecommended: boolean;
  recommendationReason: string;
}



