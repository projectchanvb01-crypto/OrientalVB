import { Injectable } from '@nestjs/common';
import {
  LOYALTY_POINT_RULES,
  WasteCategoryRate,
  WasteLocationPartner,
  WastePurchaseRecord,
} from '@oriental/types';

@Injectable()
export class WasteService {
  // Komoditas fokus utama: Minyak Jelantah (Used Cooking Oil / UCO)
  private categories: WasteCategoryRate[] = [
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

  // Mitra Penyedia Tempat (Drop Point Transit) dengan sharing 10% dari margin kotor
  private partners: WasteLocationPartner[] = [
    {
      id: 'prt-mks-01',
      code: 'DP-MKS-SENTRA',
      name: 'Sentra Kuliner Losari Makassar',
      location: 'Jl. Penghibur No. 88, Makassar',
      contactPerson: 'H. Daeng Rapi',
      phone: '+62 811-4400-991',
      profitSharePct: 10, // 10% dari margin kotor
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

  private history: WastePurchaseRecord[] = [
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
      grossMargin: 62500, // (10500 - 8000) * 25
      partnerProfitSharePct: 10,
      partnerEarnedAmount: 6250, // 10% * 62500
      pointsAwarded: 25, // 1 kg = 1 Poin
      qualityGrade: 'SUPER',
      notes: 'Jerigen 25L bersih',
      createdAt: new Date(),
    },
  ];

  getCategories(): WasteCategoryRate[] {
    return this.categories;
  }

  getPartners(): WasteLocationPartner[] {
    return this.partners;
  }

  getHistory(): WastePurchaseRecord[] {
    return this.history;
  }

  async recordPurchase(data: {
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
    partnerProfitSharePct?: number; // default 10%
    qualityGrade?: 'SUPER' | 'STANDAR' | 'KERUH';
    notes?: string;
  }): Promise<WastePurchaseRecord> {
    const netWeight = data.netWeightKg > 0 ? data.netWeightKg : Math.max(0, data.grossWeightKg - (data.tareWeightKg || 0));
    const totalCostPaid = Math.round(netWeight * data.pricePerKg);
    const pointsAwarded = Math.floor(netWeight / LOYALTY_POINT_RULES.WASTE_KG_PER_POINT); // 1 kg = 1 Poin

    // Margin Kotor = (Harga Jual Pabrik - Harga Beli) * Berat Bersih (Kg)
    const grossMargin = Math.round((data.factorySellingPricePerKg - data.pricePerKg) * netWeight);
    
    // Sharing mitra tempat = 10% dari margin kotor
    const profitSharePct = data.partnerProfitSharePct ?? 10;
    const partnerEarnedAmount = Math.round((grossMargin * profitSharePct) / 100);

    const partner = this.partners.find((p) => p.id === data.locationPartnerId);
    if (partner) {
      partner.totalWeightCollectedKg += netWeight;
      partner.totalEarnings += partnerEarnedAmount;
      partner.unpaidEarnings += partnerEarnedAmount;
    }

    const record: WastePurchaseRecord = {
      id: `wst-${Date.now().toString().slice(-6)}`,
      receiptNumber: `WST-2609-${(this.history.length + 1).toString().padStart(3, '0')}`,
      sellerMemberId: data.sellerMemberId,
      sellerName: data.sellerName || 'Penyetor Umum',
      operatorId: data.operatorId || 'usr-kasir',
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

    this.history.unshift(record);
    return record;
  }
}

