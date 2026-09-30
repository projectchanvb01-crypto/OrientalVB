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
  paidAmount?: number;
  changeAmount?: number;
  paymentMethod: string;
  cashierId: string;
  memberCode?: string;
  isSynced: boolean;
  syncedAt?: Date;
  createdAt: Date;
}

export interface SyncLogEntry {
  id?: number;
  timestamp: Date;
  totalSynced: number;
  duplicatesSkipped: number;
  invoices: string[];
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  notes?: string;
}

export class OrientalLocalDatabase extends Dexie {
  offlineCart!: Table<OfflineCartItem>;
  offlineTransactions!: Table<OfflineTransaction>;
  syncLogs!: Table<SyncLogEntry>;

  constructor() {
    super('OrientalPOS_OfflineDB');
    this.version(2).stores({
      offlineCart: '++id, productId, barcode',
      offlineTransactions: '++id, invoiceNumber, isSynced, createdAt',
      syncLogs: '++id, timestamp, status',
    });
  }

  // Get all transactions awaiting server synchronization
  async getPendingTransactions(): Promise<OfflineTransaction[]> {
    return await this.offlineTransactions
      .filter((tx) => !tx.isSynced)
      .reverse()
      .toArray();
  }

  // Get count of pending offline transactions
  async getPendingCount(): Promise<number> {
    return await this.offlineTransactions
      .filter((tx) => !tx.isSynced)
      .count();
  }

  // Mark an array of invoice numbers as synced
  async markAsSynced(invoiceNumbers: string[]): Promise<void> {
    const now = new Date();
    await this.transaction('rw', this.offlineTransactions, async () => {
      const records = await this.offlineTransactions
        .filter((tx) => invoiceNumbers.includes(tx.invoiceNumber))
        .toArray();
      for (const rec of records) {
        if (rec.id !== undefined) {
          await this.offlineTransactions.update(rec.id, { isSynced: true, syncedAt: now });
        }
      }
    });
  }

  // Record a sync audit log
  async addSyncLog(entry: Omit<SyncLogEntry, 'id'>): Promise<number> {
    return await this.syncLogs.add(entry as SyncLogEntry);
  }

  // Get recent sync logs
  async getRecentSyncLogs(limit: number = 10): Promise<SyncLogEntry[]> {
    return await this.syncLogs.orderBy('timestamp').reverse().limit(limit).toArray();
  }
}

export const localDb = new OrientalLocalDatabase();
