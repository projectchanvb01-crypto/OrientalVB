import { Injectable } from '@nestjs/common';
import { PosOrderCheckout, TransactionType, PaymentMethod } from '@oriental/types';

@Injectable()
export class PosService {
  async processCheckout(
    order: Partial<PosOrderCheckout> & {
      topDays?: number;
      dueDate?: string;
      customerName?: string;
      channel?: string;
    },
  ) {
    const isUkm = order.transactionType === TransactionType.UKM_SUPPLY || order.channel === 'UKM_SUPPLY';
    const isGrosir = order.transactionType === TransactionType.GROSIR_B2B || order.channel === 'GROSIR';
    const isB2B = isUkm || isGrosir;

    let prefix = 'RET';
    if (isUkm) prefix = 'UKM';
    else if (isGrosir) prefix = 'GRO';

    const invoiceNumber = order.invoiceNumber || `INV-${prefix}-${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      invoiceNumber,
      transactionType: order.transactionType || (isUkm ? TransactionType.UKM_SUPPLY : TransactionType.GROSIR_B2B),
      grandTotal: order.grandTotal,
      paidAmount: order.paidAmount,
      changeAmount: (order.paidAmount || 0) - (order.grandTotal || 0),
      paymentMethod: order.paymentMethod,
      topDays: order.topDays,
      dueDate: order.dueDate,
      notaFormat: isB2B ? 'CONTINUOUS_FORM_3_PLY' : 'THERMAL_80MM',
      notaCopies: isB2B ? 3 : 1,
      printedTimestamp: new Date(),
    };
  }

  // Generates 3-ply text template for continuous paper dot-matrix printers (PRD Sprint 3)
  generate3PlyNotaText(
    invoiceNumber: string,
    customerName: string,
    items: any[],
    grandTotal: number,
    channelType: 'UKM_SUPPLY' | 'GROSIR' = 'GROSIR',
    paymentType: 'CASH' | 'TERMIN' = 'CASH',
    termsPeriod: string = 'TOP 14 Hari',
    dueDateStr?: string,
  ) {
    const line = '='.repeat(54);
    const dash = '-'.repeat(54);
    const headerTitle =
      channelType === 'UKM_SUPPLY'
        ? '       ORIENTAL UKM KULINER SUPPLY CHAIN\n     Pengadaan Terpadu Bahan Baku F&B Nusantara'
        : '           ORIENTAL GROSIR NUSANTARA\n     Pusat Distribusi Partai Besar & Sembako';

    const paymentStatusLine =
      paymentType === 'CASH'
        ? 'STATUS     : LUNAS (CASH / TUNAI)'
        : `STATUS     : KREDIT / TERMIN (${termsPeriod})` + (dueDateStr ? ` - JT: ${dueDateStr}` : '');

    const makeCopy = (
      docTitle: string,
      plyName: string,
      paperColor: string,
      instructions: string,
    ) => `
${line}
${headerTitle}
${line}
NO. FAKTUR : ${invoiceNumber.padEnd(20)} TANGGAL : ${new Date().toLocaleDateString('id-ID')}
PELANGGAN  : ${customerName}
${paymentStatusLine}
DOKUMEN    : [ ${docTitle} ]
RANGKAP    : ${plyName} (Kertas ${paperColor})
${dash}
NAMA BARANG               QTY   SATUAN      HARGA      JUMLAH
${dash}
${items
  .map((item) => {
    const name = (item.name || item.productName || 'Item').padEnd(22).slice(0, 22);
    const qty = String(item.qty || item.quantity || 1).padStart(3);
    const unit = (item.unit || item.tier || 'DUS').padEnd(8).slice(0, 8);
    const priceVal = item.price || item.unitPrice || 0;
    const price = String(priceVal.toLocaleString('id-ID')).padStart(10);
    const subtotal = String(((item.qty || item.quantity || 1) * priceVal).toLocaleString('id-ID')).padStart(11);
    return `${name} ${qty} ${unit} ${price} ${subtotal}`;
  })
  .join('\n')}
${dash}
TOTAL PEMBELIAN                              Rp ${grandTotal.toLocaleString('id-ID').padStart(11)}
${line}
CATATAN DOKUMEN:
${instructions}

  Tanda Terima,              Checker Gudang,             Kasir Keuangan,


( ${customerName.slice(0, 16).padEnd(16)} )      ( Petugas Checker )         ( Bagian Kasir )
${line}
`;

    const lembar1 = makeCopy(
      'FAKTUR PENJUALAN ASLI',
      'LEMBAR 1',
      'PUTIH',
      '★ Diserahkan kepada Pelanggan sebagai bukti sah pembelian & transaksi.',
    );

    const lembar2 = makeCopy(
      'SURAT JALAN & CHECKER GUDANG',
      'LEMBAR 2',
      'MERAH / KUNING',
      '★ Dokumen kontrol fisik checker muatan keluar gudang & pengiriman ekspedisi.',
    );

    const lembar3 = makeCopy(
      'ARSIP PEMBUKUAN SAK',
      'LEMBAR 3',
      'BIRU / HIJAU',
      '★ Arsip internal kasir untuk dasar pencatatan keuangan SAK & kartu piutang.',
    );

    return {
      lembar1FakturPenjualan: lembar1,
      lembar2SuratJalanChecker: lembar2,
      lembar3ArsipPembukuan: lembar3,
      // Backward compatibility keys
      lembar1BuktiLunasCash: lembar1,
      lembar2FakturTermin: lembar2,
      lembar3ArsipPerusahaan: lembar3,
      allCopiesJoined: `${lembar1}\n\x0C\n${lembar2}\n\x0C\n${lembar3}`,
    };
  }

  // Sprint 7: PWA Offline Batch Synchronization Engine (Anti-Duplikasi & Idempotensi)
  private readonly processedInvoices = new Set<string>();

  async syncOfflineTransactions(transactions: any[], terminalId?: string) {
    const results: Array<{ invoiceNumber: string; status: 'SYNCED' | 'DUPLICATE_SKIPPED'; grandTotal?: number }> = [];
    let syncedCount = 0;
    let duplicatesSkipped = 0;

    for (const tx of transactions) {
      const inv = tx.invoiceNumber;
      if (!inv) continue;

      // Anti-duplication / Idempotency check
      if (this.processedInvoices.has(inv)) {
        duplicatesSkipped++;
        results.push({ invoiceNumber: inv, status: 'DUPLICATE_SKIPPED', grandTotal: tx.grandTotal });
        continue;
      }

      // Record invoice as successfully ingested
      this.processedInvoices.add(inv);
      syncedCount++;
      results.push({ invoiceNumber: inv, status: 'SYNCED', grandTotal: tx.grandTotal });
    }

    return {
      success: true,
      terminalId: terminalId || 'POS-TERMINAL-01',
      totalReceived: transactions.length,
      syncedCount,
      duplicatesSkipped,
      results,
      syncedAt: new Date().toISOString(),
    };
  }
}
