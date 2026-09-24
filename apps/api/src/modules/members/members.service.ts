import { Injectable, BadRequestException } from '@nestjs/common';
import {
  CustomerSegment,
  LOYALTY_POINT_RULES,
  MemberOneIdentity,
  RegisterMemberDto,
  RegionCode,
  PointMutationRecord,
} from '@oriental/types';

@Injectable()
export class MembersService {
  private members: MemberOneIdentity[] = [
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
      doorprizeCoupons: ['ORT-KUP2609-0012', 'ORT-KUP2609-0013', 'ORT-KUP2609-0014', 'ORT-KUP2609-0015'],
      pointHistory: [
        {
          id: 'mut-101',
          memberId: 'mem-001',
          date: '2026-09-20 14:30',
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
          date: '2026-09-22 10:15',
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
      memberCode: '101-260822-02',
      barcode: '82000085',
      fullName: 'Ibu Rahmawati',
      nik: '7371015509900002',
      phone: '081987654321',
      birthDate: '1990-09-15',
      gender: 'Wanita',
      email: 'rahmawati.mks@gmail.com',
      address: 'Perumahan Panakkukang Indah Blok C/10, Makassar',
      regionCode: RegionCode.MAKASSAR,
      segment: CustomerSegment.B2C_RETAIL,
      totalLoyaltyPoints: 58,
      totalSpendMonth: 5800000,
      doorprizeCouponsCount: 4,
      doorprizeCoupons: ['ORT-KUP2609-0088', 'ORT-KUP2609-0089', 'ORT-KUP2609-0090', 'ORT-KUP2609-0091'],
      pointHistory: [
        {
          id: 'mut-201',
          memberId: 'mem-002',
          date: '2026-09-21 16:45',
          invoiceNumber: 'INV-RET-391820',
          channel: 'RETAIL',
          description: 'Belanja Bulanan Swalayan Retail',
          transactionAmount: 650000,
          pointsEarned: 6,
          couponsEarned: 4,
        },
      ],
      isActive: true,
      registeredAt: new Date('2026-08-22'),
    },
    {
      id: 'mem-003',
      memberCode: '102-260825-03',
      barcode: '82000092',
      fullName: 'Haji Syamsuddin',
      nik: '7308021102720003',
      phone: '081345678912',
      birthDate: '1972-02-11',
      gender: 'Pria',
      email: 'syamsuddin.plastik@gmail.com',
      address: 'Jl. Veteran No. 44, Watampone',
      regionCode: RegionCode.WATAMPONE,
      segment: CustomerSegment.B2B_GROSIR,
      businessName: 'Toko Plastik & Frozen Maju Makmur',
      businessProfiles: [
        {
          businessIndex: 1,
          businessCode: '102-260825-03-01-900',
          businessName: 'Toko Plastik & Frozen Maju Makmur',
          businessType: 'Toko',
          businessLocation: 'Pasar Sentral Watampone',
          picName: 'Haji Syamsuddin',
          picRole: 'Pemilik',
          picWhatsapp: '081345678912',
          businessModel: 'Single Ownership',
          featuredProducts: ['Kemasan Plastik', 'Frozen Food Olahan'],
        },
      ],
      surveyData: {
        outletCount: 2,
        monthlySpendEstimate: 'Rp. 120 Jt - 150 Jt',
        mainRawMaterials: ['Kemasan Plastik', 'Frozen Food Olahan'],
        posUsage: 'Sedang bertimbang untuk pakai',
        managementStructure: 'Tidak ada, saya mengelola Sendiri',
        businessGoals: ['Tambah Bisnis', 'Penambahan Menu'],
      },
      totalLoyaltyPoints: 480,
      totalSpendMonth: 96000000,
      doorprizeCouponsCount: 38,
      doorprizeCoupons: ['ORT-KUP2609-0201', 'ORT-KUP2609-0202', 'ORT-KUP2609-0203'],
      pointHistory: [],
      isActive: true,
      registeredAt: new Date('2026-08-25'),
    },
  ];

  async getAll(query?: string, segment?: string, region?: string): Promise<MemberOneIdentity[]> {
    let result = [...this.members];

    if (query) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.memberCode.toLowerCase().includes(q) ||
          m.barcode.includes(q) ||
          m.phone.includes(q) ||
          (m.businessName && m.businessName.toLowerCase().includes(q)),
      );
    }

    if (segment) {
      result = result.filter((m) => m.segment === segment);
    }

    if (region) {
      result = result.filter((m) => m.regionCode === region);
    }

    return result;
  }

  async findByCode(code: string): Promise<MemberOneIdentity | undefined> {
    const trimmed = code.trim();
    return this.members.find(
      (m) =>
        m.memberCode === trimmed ||
        m.barcode === trimmed ||
        m.phone === trimmed ||
        (m.nik && m.nik === trimmed),
    );
  }

  // Tata Cara Pengkodean Sesuai Excel: (daerah - YYMMDD - UrutanHari)
  private generateMemberCode(regionCode: string): { memberCode: string; barcode: string } {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const yymmdd = `${yy}${mm}${dd}`;

    const seq = String(this.members.length + 1).padStart(2, '0');
    const memberCode = `${regionCode}-${yymmdd}-${seq}`;
    const barcode = `82${String(Math.floor(100000 + Math.random() * 900000))}`;

    return { memberCode, barcode };
  }

  async register(dto: RegisterMemberDto): Promise<MemberOneIdentity> {
    // Validasi No WhatsApp wajib diisi & unik
    if (!dto.fullName || !dto.phone) {
      throw new BadRequestException('Nama lengkap dan nomor WhatsApp aktif wajib diisi');
    }

    const phoneExists = this.members.find((m) => m.phone === dto.phone.trim());
    if (phoneExists) {
      throw new BadRequestException(`Nomor WhatsApp ${dto.phone} sudah terdaftar di sistem`);
    }

    const region = dto.regionCode || RegionCode.WATAMPONE;
    const { memberCode, barcode } = this.generateMemberCode(region);

    // Bangun businessProfiles jika member mengisi bisnis
    const businessProfiles = [];
    if (dto.businessName) {
      const accessCode = dto.segment === CustomerSegment.B2B_GROSIR ? '900' : '100';
      businessProfiles.push({
        businessIndex: 1,
        businessCode: `${memberCode}-01-${accessCode}`,
        businessName: dto.businessName,
        businessType: dto.businessType || 'Usaha Kuliner',
        businessLocation: dto.businessLocation || dto.address || 'Bone',
        picName: dto.picName || dto.fullName,
        picRole: dto.picRole || 'Owner',
        picWhatsapp: dto.picWhatsapp || dto.phone,
        socialMedia: dto.socialMedia,
        businessModel: dto.businessModel || 'Single Ownership',
        featuredProducts: dto.featuredProducts || ['Bahan Masakan'],
      });
    }

    const surveyData = {
      outletCount: dto.outletCount || 1,
      monthlySpendEstimate: dto.monthlySpendEstimate || 'Rp. 8 Jt - 15 Jt',
      mainRawMaterials: dto.mainRawMaterials || ['Bahan Masakan'],
      posUsage: dto.posUsage || ('Pakai' as any),
      managementStructure: (dto.managementStructure || 'Tidak ada, saya mengelola Sendiri') as any,
      businessGoals: dto.businessGoals || ['Tambah Bisnis'],
    };

    const newMember: MemberOneIdentity = {
      id: `mem-${String(this.members.length + 1).padStart(3, '0')}`,
      memberCode,
      barcode,
      fullName: dto.fullName.trim(),
      nik: dto.nik?.trim(),
      phone: dto.phone.trim(),
      birthDate: dto.birthDate,
      gender: dto.gender,
      email: dto.email?.trim(),
      address: dto.address?.trim(),
      regionCode: region,
      segment: dto.segment || CustomerSegment.B2C_RETAIL,
      businessName: dto.businessName?.trim(),
      businessProfiles: businessProfiles.length > 0 ? businessProfiles : undefined,
      surveyData,
      totalLoyaltyPoints: 0,
      totalSpendMonth: 0,
      doorprizeCouponsCount: 0,
      doorprizeCoupons: [],
      pointHistory: [],
      isActive: true,
      registeredAt: new Date(),
    };

    this.members.unshift(newMember);
    return newMember;
  }

  // Calculate Points & Doorprize based on 5 PRD Business Pillars
  calculatePointsAndCoupons(channel: string, amount: number, weightKg = 0) {
    let points = 0;
    switch (channel) {
      case 'RETAIL':
      case 'RETAIL_B2C':
        points = Math.floor(amount / LOYALTY_POINT_RULES.RETAIL_SPEND_PER_POINT);
        break;
      case 'UKM_SUPPLY':
        points = Math.floor(amount / LOYALTY_POINT_RULES.UKM_SUPPLY_SPEND_PER_POINT);
        break;
      case 'GROSIR':
      case 'GROSIR_B2B':
        points = Math.floor(amount / LOYALTY_POINT_RULES.GROSIR_SPEND_PER_POINT);
        break;
      case 'WASTE':
      case 'WASTE_PURCHASE':
        points = Math.floor(weightKg / LOYALTY_POINT_RULES.WASTE_KG_PER_POINT);
        break;
      case 'WHITE_LABEL':
        points = Math.floor(amount / LOYALTY_POINT_RULES.WHITE_LABEL_SPEND_PER_POINT);
        break;
      default:
        points = Math.floor(amount / LOYALTY_POINT_RULES.RETAIL_SPEND_PER_POINT);
    }

    // Doorprize Coupon: Every Rp 150.000 = 1 Coupon
    const coupons = Math.floor(amount / LOYALTY_POINT_RULES.DOORPRIZE_SPEND_PER_COUPON);

    return { points, coupons };
  }

  addTransactionToMember(
    memberCode: string,
    amount: number,
    channel: 'RETAIL' | 'GROSIR' | 'UKM_SUPPLY' | 'WASTE' | 'WHITE_LABEL',
    invoiceNumber: string,
    description: string,
    weightKg = 0,
  ) {
    const member = this.members.find(
      (m) => m.memberCode === memberCode || m.barcode === memberCode,
    );
    if (!member) return null;

    const { points, coupons } = this.calculatePointsAndCoupons(channel, amount, weightKg);

    member.totalLoyaltyPoints += points;
    member.totalSpendMonth += amount;
    member.doorprizeCouponsCount += coupons;

    // Issue coupons according to Master format Penomoran Kupon Undian.md:
    // Format: ORT-KUPYYMM-urutan(4 DIGIT), urutan 0001 s/d 2500. Jika > 2500 dialihkan ke bulan depan.
    const newCoupons: string[] = [];
    const now = new Date();
    let yy = String(now.getFullYear()).slice(-2);
    let mm = String(now.getMonth() + 1).padStart(2, '0');
    let yymm = `${yy}${mm}`;
    let currentSeq = (member.doorprizeCoupons?.length || 0) + 10;

    for (let i = 0; i < coupons; i++) {
      currentSeq += 1;
      if (currentSeq > LOYALTY_POINT_RULES.DOORPRIZE_MONTHLY_LIMIT) {
        const year = parseInt(`20${yymm.slice(0, 2)}`, 10);
        const month = parseInt(yymm.slice(2, 4), 10);
        const nextDate = new Date(year, month, 1);
        yymm = `${String(nextDate.getFullYear()).slice(-2)}${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
        currentSeq = 1;
      }
      const cNum = `ORT-KUP${yymm}-${String(currentSeq).padStart(4, '0')}`;
      newCoupons.push(cNum);
      if (!member.doorprizeCoupons) member.doorprizeCoupons = [];
      member.doorprizeCoupons.push(cNum);
    }

    // Record point mutation
    const mutation: PointMutationRecord = {
      id: `mut-${Date.now()}`,
      memberId: member.id,
      date: new Date().toLocaleString('id-ID'),
      invoiceNumber,
      channel,
      description,
      transactionAmount: amount,
      pointsEarned: points,
      couponsEarned: coupons,
    };

    if (!member.pointHistory) member.pointHistory = [];
    member.pointHistory.unshift(mutation);

    return {
      member,
      pointsEarned: points,
      couponsEarned: coupons,
      issuedCoupons: newCoupons,
    };
  }
}
