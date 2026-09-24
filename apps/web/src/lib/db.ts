import Dexie, { type Table } from 'dexie';

export interface OfflineCartItem {
  id?: number;
  productId: string;
  name: string;
  barcode: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OfflineTransaction {
  id?: number;
  invoiceNumber: string;
  channel: string;
  items: OfflineCartItem[];
  grandTotal: number;
  paymentMethod: string;
  cashierId: string;
  memberCode?: string;
  isSynced: boolean;
  createdAt: Date;
}

export class OrientalLocalDatabase extends Dexie {
  offlineCart!: Table<OfflineCartItem>;
  offlineTransactions!: Table<OfflineTransaction>;

  constructor() {
    super('OrientalPOS_OfflineDB');
    this.version(1).stores({
      offlineCart: '++id, productId, barcode',
      offlineTransactions: '++id, invoiceNumber, isSynced, createdAt',
    });
  }
}

export const localDb = new OrientalLocalDatabase();
