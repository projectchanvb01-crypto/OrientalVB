/// <reference types="vite/client" />
import {
  MemberOneIdentity,
  RegisterMemberDto,
  UserProfile,
  DelegateUserDto,
  UserRole,
} from '@oriental/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000/api/v1';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('oriental_jwt_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('oriental_jwt_token', token);
};

const getHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ==========================================
// 1. Authentication & RBAC API
// ==========================================
export const authApi = {
  async login(email: string, role?: UserRole) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, role }),
      });
      if (!res.ok) throw new Error(`Login failed with status ${res.status}`);
      const data = await res.json();
      if (data.accessToken) {
        setAuthToken(data.accessToken);
      }
      return data;
    } catch (err) {
      console.warn('[authApi.login] Offline fallback:', err);
      return null;
    }
  },

  async getUsers(): Promise<UserProfile[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get users failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[authApi.getUsers] Offline fallback:', err);
      return null;
    }
  },

  async delegateUser(
    creatorRole: UserRole,
    creatorName: string,
    creatorId: string,
    dto: DelegateUserDto,
  ) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/delegate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ creatorRole, creatorName, creatorId, dto }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Delegation failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn('[authApi.delegateUser] Offline fallback error:', err);
      throw err;
    }
  },

  async toggleUserStatus(id: string): Promise<UserProfile | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${id}/toggle`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Toggle status failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[authApi.toggleUserStatus] Offline fallback:', err);
      return null;
    }
  },
};

// ==========================================
// 2. Members & CRM One Identity API
// ==========================================
export const membersApi = {
  async getAll(query?: string, segment?: string, region?: string): Promise<MemberOneIdentity[] | null> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (segment && segment !== 'ALL') params.append('segment', segment);
      if (region && region !== 'ALL') params.append('region', region);

      const res = await fetch(`${API_BASE_URL}/members?${params.toString()}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get members failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[membersApi.getAll] Offline fallback:', err);
      return null;
    }
  },

  async getByCode(code: string): Promise<{ found: boolean; data?: MemberOneIdentity; message?: string } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/members/${encodeURIComponent(code)}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get member by code failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[membersApi.getByCode] Offline fallback:', err);
      return null;
    }
  },

  async register(dto: RegisterMemberDto): Promise<MemberOneIdentity | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/members/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed with status ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn('[membersApi.register] Offline fallback error:', err);
      throw err;
    }
  },

  async calculateRewards(channel: string, amount: number, weightKg?: number): Promise<{ points: number; coupons: number } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/members/calculate-rewards`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ channel, amount, weightKg: weightKg || 0 }),
      });
      if (!res.ok) throw new Error(`Calculate rewards failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[membersApi.calculateRewards] Offline fallback:', err);
      return null;
    }
  },
};

// ==========================================
// 3. POS Transactions API
// ==========================================
export const posApi = {
  async checkout(order: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/pos/checkout`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error(`POS checkout failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[posApi.checkout] Offline fallback:', err);
      return null;
    }
  },

  async preview3Ply(payload: {
    invoiceNumber: string;
    customerName: string;
    items: any[];
    grandTotal: number;
    channelType?: 'UKM_SUPPLY' | 'GROSIR';
    paymentType?: 'CASH' | 'TERMIN';
    termsPeriod?: string;
    dueDateStr?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/pos/preview-3ply`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`POS preview-3ply failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[posApi.preview3Ply] Offline fallback:', err);
      return null;
    }
  },

  async syncOfflineBatch(transactions: any[], terminalId: string = 'POS-TERMINAL-01') {
    try {
      const res = await fetch(`${API_BASE_URL}/pos/sync-offline`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ transactions, terminalId }),
      });
      if (!res.ok) throw new Error(`POS syncOfflineBatch failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[posApi.syncOfflineBatch] Offline sync error:', err);
      return null;
    }
  },
};

// ==========================================
// 4. Waste Purchasing & Profit Sharing API
// ==========================================
export const wasteApi = {
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/waste/categories`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get waste categories failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[wasteApi.getCategories] Offline fallback:', err);
      return null;
    }
  },

  async getPartners() {
    try {
      const res = await fetch(`${API_BASE_URL}/waste/partners`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get waste partners failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[wasteApi.getPartners] Offline fallback:', err);
      return null;
    }
  },

  async getHistory() {
    try {
      const res = await fetch(`${API_BASE_URL}/waste/history`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get waste history failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[wasteApi.getHistory] Offline fallback:', err);
      return null;
    }
  },

  async recordPurchase(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/waste/record-purchase`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Record waste purchase failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[wasteApi.recordPurchase] Offline fallback:', err);
      return null;
    }
  },
};

// ==========================================
// 5. White Label Production & B2B Supply API
// ==========================================
export const whiteLabelApi = {
  async getVendors() {
    try {
      const res = await fetch(`${API_BASE_URL}/white-label/vendors`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get white-label vendors failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[whiteLabelApi.getVendors] Offline fallback:', err);
      return null;
    }
  },

  async registerVendor(dto: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/white-label/vendors`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      });
      if (!res.ok) throw new Error(`Register vendor failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[whiteLabelApi.registerVendor] Offline fallback:', err);
      return null;
    }
  },

  async getContracts() {
    try {
      const res = await fetch(`${API_BASE_URL}/white-label/contracts`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get contracts failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[whiteLabelApi.getContracts] Offline fallback:', err);
      return null;
    }
  },

  async createContract(dto: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/white-label/contracts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      });
      if (!res.ok) throw new Error(`Create contract failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[whiteLabelApi.createContract] Offline fallback:', err);
      return null;
    }
  },

  async getCatalog() {
    try {
      const res = await fetch(`${API_BASE_URL}/white-label/catalog`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get catalog failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[whiteLabelApi.getCatalog] Offline fallback:', err);
      return null;
    }
  },

  async getBatchReceipts() {
    try {
      const res = await fetch(`${API_BASE_URL}/white-label/batch-receipts`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get batch receipts failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[whiteLabelApi.getBatchReceipts] Offline fallback:', err);
      return null;
    }
  },

  async receiveBatch(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/white-label/receive-batch`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Receive batch failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[whiteLabelApi.receiveBatch] Offline fallback:', err);
      return null;
    }
  },

  async getOrders() {
    try {
      const res = await fetch(`${API_BASE_URL}/white-label/orders`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get orders failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[whiteLabelApi.getOrders] Offline fallback:', err);
      return null;
    }
  },

  async orderProduct(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/white-label/order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Order white-label product failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[whiteLabelApi.orderProduct] Offline fallback:', err);
      return null;
    }
  },
};

// ==========================================
// 6. Referral Engine & Standing Order API
// ==========================================
export const referralApi = {
  async checkBusinessQualification(referrerSpend: number, refereeSpend: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/referral/check-business-qualification`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ referrerSpend, refereeSpend }),
      });
      if (!res.ok) throw new Error(`Check business failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[referralApi.checkBusinessQualification] Offline fallback:', err);
      return null;
    }
  },

  async calculateInfluencer(saleAmount: number, influencerId?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/referral/calculate-influencer`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ saleAmount, influencerId }),
      });
      if (!res.ok) throw new Error(`Calculate influencer failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[referralApi.calculateInfluencer] Offline fallback:', err);
      return null;
    }
  },

  async recordBusiness(referrerId: string, refereeId: string, transactionAmount: number) {
    try {
      const res = await fetch(`${API_BASE_URL}/referral/record-business`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ referrerId, refereeId, transactionAmount }),
      });
      if (!res.ok) throw new Error(`Record business failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[referralApi.recordBusiness] Offline fallback:', err);
      return null;
    }
  },

  async getWallet(memberId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/referral/wallet/${encodeURIComponent(memberId)}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get wallet failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[referralApi.getWallet] Offline fallback:', err);
      return null;
    }
  },

  async getCommissions(memberId?: string) {
    try {
      const url = memberId
        ? `${API_BASE_URL}/referral/commissions?memberId=${encodeURIComponent(memberId)}`
        : `${API_BASE_URL}/referral/commissions`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Get commissions failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[referralApi.getCommissions] Offline fallback:', err);
      return null;
    }
  },

  async getWithdrawals(memberId?: string) {
    try {
      const url = memberId
        ? `${API_BASE_URL}/referral/withdrawals?memberId=${encodeURIComponent(memberId)}`
        : `${API_BASE_URL}/referral/withdrawals`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Get withdrawals failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[referralApi.getWithdrawals] Offline fallback:', err);
      return null;
    }
  },

  async requestWithdrawal(data: {
    memberId: string;
    memberName: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/referral/withdraw`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Withdrawal request failed: ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn('[referralApi.requestWithdrawal] Offline fallback:', err);
      throw err;
    }
  },

  async getStandingOrders(customerMemberId?: string) {
    try {
      const url = customerMemberId
        ? `${API_BASE_URL}/referral/standing-orders?customerMemberId=${encodeURIComponent(customerMemberId)}`
        : `${API_BASE_URL}/referral/standing-orders`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Get standing orders failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[referralApi.getStandingOrders] Offline fallback:', err);
      return null;
    }
  },

  async createStandingOrder(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/referral/standing-orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Create standing order failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[referralApi.createStandingOrder] Offline fallback:', err);
      return null;
    }
  },

  async updateStandingOrderStatus(id: string, status: 'ACTIVE' | 'PAUSED' | 'CANCELLED') {
    try {
      const res = await fetch(`${API_BASE_URL}/referral/standing-orders/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Update standing order status failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[referralApi.updateStandingOrderStatus] Offline fallback:', err);
      return null;
    }
  },
};

// ==========================================
// 7. SAK Financial Reporting & Oriental Learn API (Sprint 6)
// ==========================================
export const accountingApi = {
  async getSakReports() {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/sak-reports`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get SAK reports failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[accountingApi.getSakReports] Offline fallback:', err);
      return null;
    }
  },

  async exportStatement(format: 'PDF' | 'EXCEL' = 'PDF', statementType: 'LABA_RUGI' | 'NERACA' | 'ARUS_KAS' = 'LABA_RUGI') {
    try {
      const res = await fetch(
        `${API_BASE_URL}/accounting/export?format=${format}&statementType=${statementType}`,
        { headers: getHeaders() },
      );
      if (!res.ok) throw new Error(`Export SAK report failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[accountingApi.exportStatement] Offline fallback:', err);
      return null;
    }
  },

  async getCourses() {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/learn/courses`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get courses failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[accountingApi.getCourses] Offline fallback:', err);
      return null;
    }
  },

  async submitQuiz(data: { courseId: string; memberId: string; memberName: string; answers: number[] }) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/learn/quiz/submit`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Submit quiz failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[accountingApi.submitQuiz] Offline fallback:', err);
      return null;
    }
  },

  async getWorkshops() {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/learn/workshops`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Get workshops failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[accountingApi.getWorkshops] Offline fallback:', err);
      return null;
    }
  },

  async registerWorkshop(data: {
    workshopId: string;
    memberId: string;
    memberName: string;
    phone: string;
    businessName: string;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/learn/workshops/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Register workshop failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[accountingApi.registerWorkshop] Offline fallback:', err);
      return null;
    }
  },

  async getCertificates(memberId?: string) {
    try {
      const url = memberId
        ? `${API_BASE_URL}/accounting/learn/certificates/${encodeURIComponent(memberId)}`
        : `${API_BASE_URL}/accounting/learn/certificates/ALL`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Get certificates failed: ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[accountingApi.getCertificates] Offline fallback:', err);
      return null;
    }
  },
};

// ==========================================
// 8. Sprint 8: WMS, FEFO & Landed Cost API
// ==========================================
export const wmsApi = {
  async getBatches(warningLevel?: string) {
    try {
      const url = warningLevel
        ? `${API_BASE_URL}/wms/batches?warningLevel=${warningLevel}`
        : `${API_BASE_URL}/wms/batches`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Get batches failed: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[wmsApi.getBatches] Offline fallback:', err);
      return null;
    }
  },

  async createBatch(dto: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/wms/batches`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      });
      if (!res.ok) throw new Error(`Create batch failed: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[wmsApi.createBatch] Offline fallback:', err);
      return null;
    }
  },

  async getWarningSummary() {
    try {
      const res = await fetch(`${API_BASE_URL}/wms/warning-summary`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Get warning summary failed: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[wmsApi.getWarningSummary] Offline fallback:', err);
      return null;
    }
  },

  async getConversions(productId?: string) {
    try {
      const url = productId
        ? `${API_BASE_URL}/wms/conversions?productId=${productId}`
        : `${API_BASE_URL}/wms/conversions`;
      const res = await fetch(url, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Get conversions failed: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[wmsApi.getConversions] Offline fallback:', err);
      return null;
    }
  },

  async createConversion(dto: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/wms/conversions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      });
      if (!res.ok) throw new Error(`Create conversion failed: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[wmsApi.createConversion] Offline fallback:', err);
      return null;
    }
  },

  async deleteConversion(id: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/wms/conversions/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return res.ok;
    } catch (err) {
      console.warn('[wmsApi.deleteConversion] Offline fallback:', err);
      return false;
    }
  },

  async getSuppliers() {
    try {
      const res = await fetch(`${API_BASE_URL}/wms/suppliers`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Get suppliers failed: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[wmsApi.getSuppliers] Offline fallback:', err);
      return null;
    }
  },

  async getShippingRoutes() {
    try {
      const res = await fetch(`${API_BASE_URL}/wms/shipping-routes`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Get shipping routes failed: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[wmsApi.getShippingRoutes] Offline fallback:', err);
      return null;
    }
  },

  async createShippingRoute(dto: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/wms/shipping-routes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(dto),
      });
      if (!res.ok) throw new Error(`Create shipping route failed: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[wmsApi.createShippingRoute] Offline fallback:', err);
      return {
        id: `route-${Date.now()}`,
        ...dto,
      };
    }
  },

  async calculateLandedCost(input: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/wms/landed-cost/calculate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(`Calculate landed cost failed: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[wmsApi.calculateLandedCost] Offline fallback:', err);
      return null;
    }
  },

  async compareSuppliers(productId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/wms/compare-suppliers/${productId}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Compare suppliers failed: ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[wmsApi.compareSuppliers] Offline fallback:', err);
      return null;
    }
  },
};





