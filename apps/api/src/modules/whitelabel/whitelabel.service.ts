import { Injectable } from '@nestjs/common';
import {
  LOYALTY_POINT_RULES,
  WhiteLabelBatchReceipt,
  WhiteLabelContract,
  WhiteLabelProductItem,
  WhiteLabelVendor,
  WhiteLabelB2BOrder,
} from '@oriental/types';

@Injectable()
export class WhiteLabelService {
  // 1. Data Mitra Pabrikan & Produsen Maklon
  private vendors: WhiteLabelVendor[] = [
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

  // 2. Kontrak Maklon Produksi
  private contracts: WhiteLabelContract[] = [
    {
      id: 'ctr-01',
      contractNumber: 'MKL-2026-001',
      vendorId: 'vdr-01',
      vendorName: 'CV Berkah Pangan Nusantara',
      productName: 'Roti Manis Oriental Bakery (Karton @ 24 Pcs)',
      brandName: 'Oriental Bakery & Pastry',
      targetQuantity: 500, // karton
      unit: 'Karton',
      productionCostPerUnit: 60000, // HPP dari pabrik
      sellingPriceToB2B: 85000,    // Harga jual ke Cafe/Resto
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

  // 3. Katalog Produk White Label untuk Dipesan oleh B2B UKM Supply
  private catalogProducts: WhiteLabelProductItem[] = [
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

  // 4. Riwayat Penerimaan Batch (GRN)
  private batchReceipts: WhiteLabelBatchReceipt[] = [
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

  // 5. Riwayat Order B2B UKM Supply untuk Produk White Label
  private b2bOrders: WhiteLabelB2BOrder[] = [
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
      // User Directive: Rp 10.000 = 1 Poin untuk Customer B2B UKM Supply
      pointsAwarded: Math.floor(425000 / LOYALTY_POINT_RULES.WHITE_LABEL_SPEND_PER_POINT), // 42 Poin
      orderDate: '2026-09-22',
      status: 'DELIVERED',
    },
  ];

  getVendors(): WhiteLabelVendor[] {
    return this.vendors;
  }

  getContracts(): WhiteLabelContract[] {
    return this.contracts;
  }

  getCatalogProducts(): WhiteLabelProductItem[] {
    return this.catalogProducts;
  }

  getBatchReceipts(): WhiteLabelBatchReceipt[] {
    return this.batchReceipts;
  }

  getB2BOrders(): WhiteLabelB2BOrder[] {
    return this.b2bOrders;
  }

  registerVendor(dto: Omit<WhiteLabelVendor, 'id' | 'code' | 'isActive'>): WhiteLabelVendor {
    const newVendor: WhiteLabelVendor = {
      id: `vdr-${(this.vendors.length + 1).toString().padStart(2, '0')}`,
      code: `VDR-${Date.now().toString().slice(-4)}`,
      ...dto,
      isActive: true,
    };
    this.vendors.push(newVendor);
    return newVendor;
  }

  createContract(dto: Omit<WhiteLabelContract, 'id' | 'contractNumber' | 'status'>): WhiteLabelContract {
    const newContract: WhiteLabelContract = {
      id: `ctr-${(this.contracts.length + 1).toString().padStart(2, '0')}`,
      contractNumber: `MKL-2026-${(this.contracts.length + 1).toString().padStart(3, '0')}`,
      ...dto,
      status: 'ACTIVE',
    };
    this.contracts.push(newContract);
    return newContract;
  }

  receiveBatch(data: {
    contractId: string;
    batchNumber: string;
    receivedQuantity: number;
    qcPassed: boolean;
    qcNotes?: string;
  }): WhiteLabelBatchReceipt {
    const contract = this.contracts.find((c) => c.id === data.contractId);
    if (!contract) {
      throw new Error('Kontrak maklon tidak ditemukan');
    }

    const totalValue = data.receivedQuantity * contract.productionCostPerUnit;

    const receipt: WhiteLabelBatchReceipt = {
      id: `grn-${Date.now().toString().slice(-6)}`,
      receiptNumber: `GRN-2609-${(this.batchReceipts.length + 1).toString().padStart(3, '0')}`,
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

    this.batchReceipts.unshift(receipt);

    // Update catalog stock
    const product = this.catalogProducts.find((p) => p.contractId === contract.id);
    if (product && data.qcPassed) {
      product.stockAvailable += data.receivedQuantity;
    }

    return receipt;
  }

  // Aturan Khusus User: Point diterima oleh costumer oriental khusus B2B Ukm Supply.
  // Semisal, Cafe memesan roti manis (pabrikan mitra whitelabel oriental) melalui oriental Ekosistem.
  // Maka setiap kelipatan Rp 10.000, costumer B2B UKM Supply mendapatkan 1 point!
  orderWhiteLabelProduct(data: {
    customerMemberId: string;
    customerName: string;
    customerSegment: string;
    productId: string;
    quantity: number;
  }): WhiteLabelB2BOrder {
    const product = this.catalogProducts.find((p) => p.id === data.productId);
    if (!product) {
      throw new Error('Produk white label tidak ditemukan');
    }

    if (product.stockAvailable < data.quantity) {
      throw new Error(`Stok tidak mencukupi (Tersedia: ${product.stockAvailable})`);
    }

    product.stockAvailable -= data.quantity;

    const totalAmount = data.quantity * product.priceToB2B;
    const pointsAwarded = Math.floor(totalAmount / LOYALTY_POINT_RULES.WHITE_LABEL_SPEND_PER_POINT); // Rp 10.000 = 1 Poin

    const order: WhiteLabelB2BOrder = {
      id: `wlo-${Date.now().toString().slice(-6)}`,
      orderNumber: `WLO-2609-${(this.b2bOrders.length + 1).toString().padStart(3, '0')}`,
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

    this.b2bOrders.unshift(order);
    return order;
  }
}
