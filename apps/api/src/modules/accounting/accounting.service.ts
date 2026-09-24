import { Injectable, BadRequestException } from '@nestjs/common';
import {
  IncomeStatementSAK,
  BalanceSheetSAK,
  CashFlowStatementSAK,
  CourseModule,
  QuizSubmissionDto,
  QuizResult,
  DigitalCertificate,
  OfflineWorkshop,
  WorkshopRegistrationDto,
} from '@oriental/types';

@Injectable()
export class AccountingService {
  // Pre-configured Oriental Learn Courses
  private courses: CourseModule[] = [
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

  // Pre-configured Offline Workshops
  private workshops: OfflineWorkshop[] = [
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

  // Issued Digital Certificates
  private certificates: DigitalCertificate[] = [
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

  // Generates 3 SAK-compliant financial reports
  getFinancialStatementsSAK(): {
    incomeStatement: IncomeStatementSAK;
    balanceSheet: BalanceSheetSAK;
    cashFlowStatement: CashFlowStatementSAK;
  } {
    // 1. Laporan Laba Rugi (Statement of Profit or Loss)
    const incomeStatement: IncomeStatementSAK = {
      title: 'Laporan Laba Rugi Komprehensif (Standar Akuntansi Keuangan SAK)',
      period: 'Periode Berjalan: Januari - September 2026',
      revenue: {
        retailSales: 850000000,
        grosirSales: 1650000000,
        ukmSupplySales: 720000000,
        whiteLabelSales: 400000000,
        wasteSales: 33000000,
        totalRevenue: 3653000000,
      },
      cogs: {
        costOfGoodsSold: 2675000000,
        grossProfit: 978000000,
      },
      operatingExpenses: {
        salaries: 240000000,
        referralCommissions: 48000000,
        utilitiesAndRent: 80000000,
        wasteProfitShare: 3300000,
        totalExpenses: 371300000,
      },
      netOperatingProfit: 606700000,
    };

    // 2. Laporan Posisi Keuangan / Neraca (Statement of Financial Position)
    // SAK Fundamental Accounting Equation: Total Assets = Total Liabilities + Total Equity
    const currentAssets = {
      cashAndBank: 420000000,
      accountsReceivable: 310000000, // Piutang Dagang Grosir & B2B (TOP)
      inventoryMerchandise: 680000000,
      inventoryWaste: 25000000,
      totalCurrentAssets: 1435000000,
    };

    const fixedAssets = {
      equipmentAndVehicles: 350000000,
      accumulatedDepreciation: -50000000,
      netFixedAssets: 300000000,
    };

    const totalAssets = currentAssets.totalCurrentAssets + fixedAssets.netFixedAssets; // 1.735.000.000

    const liabilities = {
      accountsPayableVendors: 480000000,
      partnerWasteAccrual: 35000000,
      unpaidReferralCommission: 12000000,
      totalLiabilities: 527000000,
    };

    const equity = {
      ownerCapital: 601300000,
      retainedEarnings: 606700000, // Matches netOperatingProfit
      totalEquity: 1208000000,
    };

    const totalLiabilitiesAndEquity = liabilities.totalLiabilities + equity.totalEquity; // 1.735.000.000
    const isBalanced = totalAssets === totalLiabilitiesAndEquity;

    const balanceSheet: BalanceSheetSAK = {
      title: 'Laporan Posisi Keuangan / Neraca (Standar Akuntansi Keuangan SAK)',
      asOfDate: '2026-09-24',
      assets: {
        currentAssets,
        fixedAssets,
        totalAssets,
      },
      liabilitiesAndEquity: {
        liabilities,
        equity,
        totalLiabilitiesAndEquity,
      },
      isBalanced,
    };

    // 3. Laporan Arus Kas (Statement of Cash Flows)
    const cashFlowStatement: CashFlowStatementSAK = {
      title: 'Laporan Arus Kas (Metode Langsung SAK)',
      period: 'Periode Berjalan: Januari - September 2026',
      operatingActivities: 495000000,
      investingActivities: -120000000,
      financingActivities: 45000000,
      netCashIncrease: 420000000,
      endingCashBalance: 420000000,
    };

    return {
      incomeStatement,
      balanceSheet,
      cashFlowStatement,
    };
  }

  // Export Financial Reports to Printable PDF or Spreadsheet CSV/Excel format
  exportFinancialStatement(format: 'PDF' | 'EXCEL', statementType: 'LABA_RUGI' | 'NERACA' | 'ARUS_KAS') {
    const data = this.getFinancialStatementsSAK();
    const timestamp = new Date().toISOString();

    return {
      format,
      statementType,
      exportedAt: timestamp,
      documentTitle: `Laporan Keuangan Oriental Ecosystem - ${statementType} (${format})`,
      auditSignOff: {
        company: 'PT Oriental Digital Ekosistem Indonesia',
        accountantCertificationNumber: 'CPA-SAK-2026/09/881',
        isBalancedVerified: data.balanceSheet.isBalanced,
      },
      payload: data,
    };
  }

  // Oriental Learn: Get all courses
  getCourses(): CourseModule[] {
    return this.courses;
  }

  // Oriental Learn: Submit quiz & evaluate certificate qualification (> 80%)
  submitQuiz(dto: QuizSubmissionDto): QuizResult {
    const course = this.courses.find((c) => c.id === dto.courseId);
    if (!course) {
      throw new BadRequestException('Modul kursus tidak ditemukan.');
    }

    const totalQuestions = course.quizQuestions.length;
    let correctAnswersCount = 0;

    course.quizQuestions.forEach((q, idx) => {
      if (dto.answers[idx] === q.correctAnswerIndex) {
        correctAnswersCount += 1;
      }
    });

    const scorePct = Math.round((correctAnswersCount / totalQuestions) * 100);
    // Acceptance Criteria 2: Score > 80% qualifies for certificate
    const passed = scorePct > 80;

    let certificate: DigitalCertificate | undefined;
    if (passed) {
      const certSeq = (this.certificates.length + 1).toString().padStart(4, '0');
      const certificateNumber = `CERT-ORT-202609-${certSeq}`;

      certificate = {
        id: `cert-${Date.now().toString().slice(-6)}`,
        certificateNumber,
        memberId: dto.memberId,
        memberName: dto.memberName,
        courseTitle: course.title,
        category: course.categoryLabel,
        scorePct,
        issueDate: new Date().toISOString().split('T')[0],
        qrCodeUrl: `https://oriental.co.id/verify-cert/${certificateNumber}`,
        verificationHash: `SHA256-${Date.now().toString(16).toUpperCase()}`,
      };

      this.certificates.unshift(certificate);
    }

    const feedback = passed
      ? `Selamat! Anda lulus kuis dengan skor sempurna/unggul ${scorePct}% (> 80%). Sertifikat digital resmi ber-QR Code telah diterbitkan dan dapat langsung diunduh!`
      : `Skor Anda adalah ${scorePct}%. Standar sertifikasi SAK Oriental mewajibkan skor kelulusan > 80%. Silakan tinjau kembali modul pembelajaran dan ulangi kuis.`;

    return {
      courseId: course.id,
      memberId: dto.memberId,
      scorePct,
      passed,
      correctAnswersCount,
      totalQuestions,
      certificate,
      feedback,
    };
  }

  // Oriental Learn: Get offline workshops
  getWorkshops(): OfflineWorkshop[] {
    return this.workshops;
  }

  // Oriental Learn: Register for workshop
  registerWorkshop(dto: WorkshopRegistrationDto) {
    const workshop = this.workshops.find((w) => w.id === dto.workshopId);
    if (!workshop) {
      throw new BadRequestException('Workshop tidak ditemukan.');
    }
    if (workshop.isFull || workshop.registeredCount >= workshop.quota) {
      throw new BadRequestException('Kuota workshop tatap muka telah penuh.');
    }

    workshop.registeredCount += 1;
    if (workshop.registeredCount >= workshop.quota) {
      workshop.isFull = true;
    }

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
  }

  // Oriental Learn: Get certificates for member
  getCertificates(memberId?: string): DigitalCertificate[] {
    if (!memberId || memberId === 'ALL') return this.certificates;
    return this.certificates.filter((c) => c.memberId === memberId);
  }
}
