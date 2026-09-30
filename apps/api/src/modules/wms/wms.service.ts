import { Injectable, BadRequestException } from '@nestjs/common';
import {
  ProductBatch,
  BatchWarningLevel,
  DynamicUnitConversion,
  SupplierItem,
  ShippingRouteItem,
  LandedCostInput,
  LandedCostBreakdown,
  SupplierComparisonItem,
} from '@oriental/types';

@Injectable()
export class WmsService {
  // Pre-seeded Suppliers (Lokal & Lintas Pulau)
  private suppliers: SupplierItem[] = [
    {
      id: 'sup-001',
      name: 'PT Sinar Pangan Nusantara (Surabaya)',
      contactPerson: 'Hendra Wijaya',
      phone: '+62 812-3456-7890',
      email: 'sales@sinarpangan.co.id',
      locationCity: 'Surabaya (Tanjung Perak)',
      isPkp: true,
      npwp: '01.234.567.8-012.000',
      leadTimeDays: 5,
      rating: 4.9,
      isActive: true,
    },
    {
      id: 'sup-002',
      name: 'CV Makmur Sejahtera (Jakarta)',
      contactPerson: 'Budi Santoso',
      phone: '+62 811-9876-5432',
      email: 'order@makmursejahtera.com',
      locationCity: 'Jakarta (Tanjung Priok)',
      isPkp: true,
      npwp: '02.987.654.3-021.000',
      leadTimeDays: 6,
      rating: 4.7,
      isActive: true,
    },
    {
      id: 'sup-003',
      name: 'Distributor Sembako Lokal Jaya (Makassar)',
      contactPerson: 'Haji Ramli',
      phone: '+62 852-1122-3344',
      email: 'ramli.sembako@gmail.com',
      locationCity: 'Makassar (Lokal Gudang)',
      isPkp: false,
      npwp: undefined,
      leadTimeDays: 1,
      rating: 4.5,
      isActive: true,
    },
    {
      id: 'sup-004',
      name: 'Pabrik Minyak Goreng Sawit Lestari (Semarang)',
      contactPerson: 'Dewi Kartika',
      phone: '+62 813-8899-0011',
      email: 'dewi@sawitlestari.co.id',
      locationCity: 'Semarang (Tanjung Emas)',
      isPkp: true,
      npwp: '03.456.789.0-032.000',
      leadTimeDays: 5,
      rating: 4.8,
      isActive: true,
    },
  ];

  // Pre-seeded Shipping Routes (Ekspedisi Laut Pelni / Meratus / Samudera)
  private shippingRoutes: ShippingRouteItem[] = [
    {
      id: 'route-sub-upg',
      expeditionName: 'Meratus Line (Container Cargo)',
      originPort: 'Tanjung Perak (Surabaya)',
      destinationPort: 'Soekarno-Hatta (Makassar)',
      ratePerCbm: 425000, // Rp 425.000 per m3
      minCbm: 1.5,
      handlingFee: 150000, // Port & document fee
      truckingFee: 350000, // Trucking ke gudang Oriental
      estimatedDays: 4,
    },
    {
      id: 'route-jkt-upg',
      expeditionName: 'Samudera Indonesia (Breakbulk & CBM)',
      originPort: 'Tanjung Priok (Jakarta)',
      destinationPort: 'Soekarno-Hatta (Makassar)',
      ratePerCbm: 520000, // Rp 520.000 per m3
      minCbm: 2.0,
      handlingFee: 200000,
      truckingFee: 350000,
      estimatedDays: 6,
    },
    {
      id: 'route-smg-upg',
      expeditionName: 'Pelni Logistik (Kapal Tol Laut)',
      originPort: 'Tanjung Emas (Semarang)',
      destinationPort: 'Soekarno-Hatta (Makassar)',
      ratePerCbm: 390000, // Rp 390.000 per m3 (Subsidized rate)
      minCbm: 1.0,
      handlingFee: 120000,
      truckingFee: 350000,
      estimatedDays: 5,
    },
    {
      id: 'route-lokal',
      expeditionName: 'Armada Pickup Lokal (Darat Langsung)',
      originPort: 'Gudang Suplier Makassar',
      destinationPort: 'Oriental Warehouse Makassar',
      ratePerCbm: 0,
      minCbm: 0,
      handlingFee: 0,
      truckingFee: 150000, // Flat delivery lokal
      estimatedDays: 1,
    },
  ];

  // Initial Seeded Batches with FEFO Warning Levels
  private batches: ProductBatch[] = [
    {
      id: 'batch-001',
      productId: 'p-001',
      productName: 'Minyak Goreng SunCo 2L Pouch',
      sku: 'MKO-SNC-2L',
      batchNumber: 'BATCH-2026-08A',
      expiryDate: '2026-10-15', // ~19 hari lagi -> LEVEL MERAH (CRITICAL / AUTO PROMO)
      stockQty: 48,
      costPrice: 32500,
      warningLevel: 'RED',
      daysRemaining: 19,
      status: 'CLEARANCE_PROMO',
      receivedDate: '2026-04-10',
      supplierName: 'PT Sinar Pangan Nusantara (Surabaya)',
    },
    {
      id: 'batch-002',
      productId: 'p-001',
      productName: 'Minyak Goreng SunCo 2L Pouch',
      sku: 'MKO-SNC-2L',
      batchNumber: 'BATCH-2026-10B',
      expiryDate: '2026-12-20', // ~85 hari lagi -> LEVEL KUNING (AMBER / FEFO FRONT SHELF)
      stockQty: 180,
      costPrice: 33000,
      warningLevel: 'AMBER',
      daysRemaining: 85,
      status: 'ACTIVE',
      receivedDate: '2026-07-15',
      supplierName: 'PT Sinar Pangan Nusantara (Surabaya)',
    },
    {
      id: 'batch-003',
      productId: 'p-001',
      productName: 'Minyak Goreng SunCo 2L Pouch',
      sku: 'MKO-SNC-2L',
      batchNumber: 'BATCH-2026-12C',
      expiryDate: '2027-05-30', // > 240 hari -> LEVEL HIJAU (AMAN)
      stockQty: 420,
      costPrice: 33500,
      warningLevel: 'GREEN',
      daysRemaining: 246,
      status: 'ACTIVE',
      receivedDate: '2026-09-01',
      supplierName: 'Pabrik Minyak Goreng Sawit Lestari (Semarang)',
    },
    {
      id: 'batch-004',
      productId: 'p-002',
      productName: 'Beras Premium Pandan Wangi 5Kg',
      sku: 'BRS-PDW-5K',
      batchNumber: 'BATCH-2026-09R',
      expiryDate: '2026-10-22', // ~26 hari lagi -> LEVEL MERAH
      stockQty: 25,
      costPrice: 68000,
      warningLevel: 'RED',
      daysRemaining: 26,
      status: 'CLEARANCE_PROMO',
      receivedDate: '2026-05-10',
      supplierName: 'Distributor Sembako Lokal Jaya (Makassar)',
    },
    {
      id: 'batch-005',
      productId: 'p-003',
      productName: 'Susu UHT Full Cream Diamond 1L',
      sku: 'SSU-DMD-1L',
      batchNumber: 'BATCH-2026-11K',
      expiryDate: '2026-11-28', // ~63 hari lagi -> LEVEL KUNING
      stockQty: 96,
      costPrice: 17200,
      warningLevel: 'AMBER',
      daysRemaining: 63,
      status: 'ACTIVE',
      receivedDate: '2026-08-05',
      supplierName: 'CV Makmur Sejahtera (Jakarta)',
    },
    {
      id: 'batch-006',
      productId: 'p-004',
      productName: 'Tepung Terigu Segitiga Biru 1Kg',
      sku: 'TPG-SGB-1K',
      batchNumber: 'BATCH-2026-12Z',
      expiryDate: '2027-04-10', // > 190 hari -> LEVEL HIJAU
      stockQty: 300,
      costPrice: 10800,
      warningLevel: 'GREEN',
      daysRemaining: 196,
      status: 'ACTIVE',
      receivedDate: '2026-08-20',
      supplierName: 'PT Sinar Pangan Nusantara (Surabaya)',
    },
  ];

  // Pre-seeded Dynamic Unit Conversions
  private conversions: DynamicUnitConversion[] = [
    {
      id: 'conv-001',
      productId: 'p-001',
      unitName: 'Dus 6 Pouch (12L)',
      multiplierQty: 6,
      barcode: '899123456006',
      isDefaultB2b: true,
      priceEstimate: 198000,
    },
    {
      id: 'conv-002',
      productId: 'p-001',
      unitName: 'Karton Jumbo 12 Pouch (24L)',
      multiplierQty: 12,
      barcode: '899123456012',
      isDefaultB2b: false,
      priceEstimate: 390000,
    },
    {
      id: 'conv-003',
      productId: 'p-003',
      unitName: 'Karton 12 Liter',
      multiplierQty: 12,
      barcode: '899987654012',
      isDefaultB2b: true,
      priceEstimate: 215000,
    },
    {
      id: 'conv-004',
      productId: 'p-004',
      unitName: 'Bal 10 Kg',
      multiplierQty: 10,
      barcode: '899555666010',
      isDefaultB2b: true,
      priceEstimate: 115000,
    },
    {
      id: 'conv-005',
      productId: 'p-004',
      unitName: 'Zak 25 Kg',
      multiplierQty: 25,
      barcode: '899555666025',
      isDefaultB2b: false,
      priceEstimate: 280000,
    },
  ];

  // Recalculates warning levels dynamically based on current date
  private evaluateWarningLevel(expiryDateStr: string): { warningLevel: BatchWarningLevel; daysRemaining: number } {
    const today = new Date();
    const expiry = new Date(expiryDateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let warningLevel: BatchWarningLevel = 'GREEN';
    if (daysRemaining <= 30) {
      warningLevel = 'RED';
    } else if (daysRemaining <= 90) {
      warningLevel = 'AMBER';
    } else {
      warningLevel = 'GREEN';
    }

    return { warningLevel, daysRemaining };
  }

  // 1. FEFO & Product Batches
  getBatches(filterLevel?: BatchWarningLevel): ProductBatch[] {
    return this.batches
      .map((b) => {
        const { warningLevel, daysRemaining } = this.evaluateWarningLevel(b.expiryDate);
        return {
          ...b,
          warningLevel,
          daysRemaining,
          status: daysRemaining <= 0 ? 'EXPIRED' : warningLevel === 'RED' ? 'CLEARANCE_PROMO' : b.status,
        };
      })
      .filter((b) => (filterLevel ? b.warningLevel === filterLevel : true))
      .sort((a, b) => a.daysRemaining - b.daysRemaining); // FEFO: First Expired First Out
  }

  createBatch(dto: {
    productId: string;
    productName: string;
    sku: string;
    batchNumber: string;
    expiryDate: string;
    stockQty: number;
    costPrice: number;
    supplierName?: string;
  }): ProductBatch {
    const { warningLevel, daysRemaining } = this.evaluateWarningLevel(dto.expiryDate);
    const newBatch: ProductBatch = {
      id: `batch-${Date.now()}`,
      productId: dto.productId,
      productName: dto.productName,
      sku: dto.sku,
      batchNumber: dto.batchNumber || `BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: dto.expiryDate,
      stockQty: dto.stockQty,
      costPrice: dto.costPrice,
      warningLevel,
      daysRemaining,
      status: warningLevel === 'RED' ? 'CLEARANCE_PROMO' : 'ACTIVE',
      receivedDate: new Date().toISOString().split('T')[0],
      supplierName: dto.supplierName || 'General Supplier',
    };

    this.batches.unshift(newBatch);
    return newBatch;
  }

  getWarningLevelSummary() {
    const evaluated = this.getBatches();
    const redBatches = evaluated.filter((b) => b.warningLevel === 'RED');
    const amberBatches = evaluated.filter((b) => b.warningLevel === 'AMBER');
    const greenBatches = evaluated.filter((b) => b.warningLevel === 'GREEN');

    const totalRedStockValue = redBatches.reduce((acc, b) => acc + b.stockQty * b.costPrice, 0);
    const totalAmberStockValue = amberBatches.reduce((acc, b) => acc + b.stockQty * b.costPrice, 0);
    const totalStockValue = evaluated.reduce((acc, b) => acc + b.stockQty * b.costPrice, 0);

    return {
      totalBatches: evaluated.length,
      redCount: redBatches.length,
      amberCount: amberBatches.length,
      greenCount: greenBatches.length,
      redStockValue: totalRedStockValue,
      amberStockValue: totalAmberStockValue,
      totalStockValue,
      urgentActionRequired: redBatches.length > 0,
      redBatches,
    };
  }

  // 2. Dynamic Unit Conversions
  getConversions(productId?: string): DynamicUnitConversion[] {
    if (productId) {
      return this.conversions.filter((c) => c.productId === productId);
    }
    return this.conversions;
  }

  createConversion(dto: {
    productId: string;
    unitName: string;
    multiplierQty: number;
    barcode?: string;
    isDefaultB2b?: boolean;
    priceEstimate?: number;
  }): DynamicUnitConversion {
    if (!dto.unitName || dto.multiplierQty <= 0) {
      throw new BadRequestException('Nama satuan dan jumlah multiplier wajib diisi dengan benar');
    }
    const newConv: DynamicUnitConversion = {
      id: `conv-${Date.now()}`,
      productId: dto.productId,
      unitName: dto.unitName,
      multiplierQty: dto.multiplierQty,
      barcode: dto.barcode,
      isDefaultB2b: dto.isDefaultB2b ?? false,
      priceEstimate: dto.priceEstimate,
    };
    this.conversions.push(newConv);
    return newConv;
  }

  deleteConversion(id: string): boolean {
    const idx = this.conversions.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.conversions.splice(idx, 1);
      return true;
    }
    return false;
  }

  // 3. Suppliers & Shipping Routes
  getSuppliers(): SupplierItem[] {
    return this.suppliers;
  }

  createSupplier(dto: Partial<SupplierItem>): SupplierItem {
    if (!dto.name || !dto.locationCity) {
      throw new BadRequestException('Nama dan lokasi kota supplier wajib diisi');
    }
    const newSup: SupplierItem = {
      id: `sup-${Date.now()}`,
      name: dto.name,
      contactPerson: dto.contactPerson,
      phone: dto.phone || '-',
      email: dto.email,
      locationCity: dto.locationCity,
      isPkp: dto.isPkp ?? false,
      npwp: dto.npwp,
      leadTimeDays: dto.leadTimeDays || 3,
      rating: 5.0,
      isActive: true,
    };
    this.suppliers.push(newSup);
    return newSup;
  }

  getShippingRoutes(): ShippingRouteItem[] {
    return this.shippingRoutes;
  }

  createShippingRoute(dto: Partial<ShippingRouteItem>): ShippingRouteItem {
    const newRoute: ShippingRouteItem = {
      id: `route-${Date.now()}`,
      supplierId: dto.supplierId,
      expeditionName: dto.expeditionName || 'Ekspedisi Laut Pelni / Meratus',
      originPort: dto.originPort || 'Tanjung Perak (Surabaya)',
      destinationPort: dto.destinationPort || 'Soekarno-Hatta (Makassar)',
      ratePerCbm: dto.ratePerCbm || 450000,
      minCbm: dto.minCbm || 1.0,
      handlingFee: dto.handlingFee || 150000,
      truckingFee: dto.truckingFee || 350000,
      estimatedDays: dto.estimatedDays || 5,
    };
    this.shippingRoutes.push(newRoute);
    return newRoute;
  }

  // 4. Landed Cost Calculator (Antar-Pulau Sea Freight CBM Formula)
  calculateLandedCost(input: LandedCostInput): LandedCostBreakdown {
    const {
      lengthCm,
      widthCm,
      heightCm,
      unitsPerCarton,
      totalCartons,
      factoryPricePerUnit,
      supplierIsPkp,
      shippingRouteId,
    } = input;

    if (lengthCm <= 0 || widthCm <= 0 || heightCm <= 0 || unitsPerCarton <= 0 || totalCartons <= 0) {
      throw new BadRequestException('Dimensi, jumlah karton, dan isi per karton harus lebih besar dari 0');
    }

    const route = this.shippingRoutes.find((r) => r.id === shippingRouteId) || this.shippingRoutes[0];

    // Volume formula: (P x L x T in cm) / 1,000,000 = m3 (CBM)
    const cbmPerCarton = (lengthCm * widthCm * heightCm) / 1000000;
    const totalCbm = cbmPerCarton * totalCartons;
    const totalUnits = totalCartons * unitsPerCarton;
    const totalFactoryCost = factoryPricePerUnit * totalUnits;

    // Freight calculation with minimum CBM threshold
    const billableCbm = Math.max(totalCbm, route.minCbm);
    const seaFreightCost = billableCbm * route.ratePerCbm;
    const portHandlingCost = route.handlingFee;
    const truckingCost = route.truckingFee;
    const totalLogisticsCost = seaFreightCost + portHandlingCost + truckingCost;
    const logisticsCostPerUnit = Math.round(totalLogisticsCost / totalUnits);

    // Pajak Masukan (PPN 11% jika supplier PKP)
    // Jika supplier PKP, PPN Masukan bisa dikreditkan secara akuntansi.
    const ppnMasukanPerUnit = supplierIsPkp ? Math.round(factoryPricePerUnit * 0.11) : 0;

    // Net Landed Cost per unit di gudang Oriental
    const totalLandedCostPerUnit = factoryPricePerUnit + logisticsCostPerUnit;

    // Rekomendasi Harga Jual:
    // Retail Margin = 25%
    // Wholesale Margin = 12%
    const recommendedRetailPrice = Math.ceil((totalLandedCostPerUnit * 1.25) / 500) * 500;
    const recommendedWholesalePrice = Math.ceil((totalLandedCostPerUnit * 1.12) / 500) * 500;

    const estimatedGrossProfitAtRetail = recommendedRetailPrice - totalLandedCostPerUnit;
    const marginPercentageAtRetail = Math.round((estimatedGrossProfitAtRetail / recommendedRetailPrice) * 100);

    return {
      cbmPerCarton: Number(cbmPerCarton.toFixed(4)),
      totalCbm: Number(totalCbm.toFixed(3)),
      totalUnits,
      totalFactoryCost,
      seaFreightCost,
      portHandlingCost,
      truckingCost,
      totalLogisticsCost,
      logisticsCostPerUnit,
      ppnMasukanPerUnit,
      totalLandedCostPerUnit,
      recommendedRetailPrice,
      recommendedWholesalePrice,
      estimatedGrossProfitAtRetail,
      marginPercentageAtRetail,
    };
  }

  // 5. Supplier Comparison Engine (Comparing Tool)
  compareSuppliers(productId: string): SupplierComparisonItem[] {
    // Standard mock product data for comparison (e.g. Minyak Goreng 2L Pouch)
    return [
      {
        supplierId: 'sup-001',
        supplierName: 'PT Sinar Pangan Nusantara (Surabaya)',
        locationCity: 'Surabaya (Jawa Timur)',
        isPkp: true,
        factoryPrice: 30500,
        routeTitle: 'Meratus Line (Perak -> UPG)',
        estimatedLeadTime: 5,
        logisticsCostPerUnit: 1450, // Landed freight per pouch
        netLandedCostPerUnit: 31950,
        retailPrice: 38500,
        marginRp: 6550,
        marginPct: 17.0,
        isRecommended: true,
        recommendationReason: 'Paling efisien! Harga pabrik rendah, status PKP resmi (Faktur Pajak 11% dapat dikreditkan).',
      },
      {
        supplierId: 'sup-004',
        supplierName: 'Pabrik Sawit Lestari (Semarang)',
        locationCity: 'Semarang (Jawa Tengah)',
        isPkp: true,
        factoryPrice: 31200,
        routeTitle: 'Pelni Tol Laut (Tanjung Emas -> UPG)',
        estimatedLeadTime: 5,
        logisticsCostPerUnit: 1320,
        netLandedCostPerUnit: 32520,
        retailPrice: 38500,
        marginRp: 5980,
        marginPct: 15.5,
        isRecommended: false,
        recommendationReason: 'Alternatif solid saat Surabaya overload kuota kontainer.',
      },
      {
        supplierId: 'sup-003',
        supplierName: 'Distributor Sembako Lokal Jaya (Makassar)',
        locationCity: 'Makassar (Lokal Sulawesi)',
        isPkp: false,
        factoryPrice: 34500,
        routeTitle: 'Pickup Armada Darat Lokal',
        estimatedLeadTime: 1,
        logisticsCostPerUnit: 350,
        netLandedCostPerUnit: 34850,
        retailPrice: 38500,
        marginRp: 3650,
        marginPct: 9.5,
        isRecommended: false,
        recommendationReason: 'Lead time instan (1 hari), namun HPP lebih mahal Rp 2.900/pcs dan Non-PKP.',
      },
    ];
  }
}
