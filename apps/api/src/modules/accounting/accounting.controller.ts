import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { QuizSubmissionDto, WorkshopRegistrationDto } from '@oriental/types';

@ApiTags('Financial & SAK Accounting')
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('sak-reports')
  @ApiOperation({ summary: 'Dapatkan 3 Laporan Keuangan Pokok Standar SAK (Laba Rugi, Neraca Seimbang, Arus Kas)' })
  getSakReports() {
    return this.accountingService.getFinancialStatementsSAK();
  }

  @Get('export')
  @ApiOperation({ summary: 'Ekspor laporan keuangan ke format PDF resmi atau Spreadsheet Excel' })
  exportStatement(
    @Query('format') format: 'PDF' | 'EXCEL' = 'PDF',
    @Query('statementType') statementType: 'LABA_RUGI' | 'NERACA' | 'ARUS_KAS' = 'LABA_RUGI',
  ) {
    return this.accountingService.exportFinancialStatement(format, statementType);
  }

  // ==========================================
  // Oriental Learn Endpoints (Sprint 6 Deliverable 3)
  // ==========================================
  @Get('learn/courses')
  @ApiOperation({ summary: 'Daftar materi kursus video Oriental Learn untuk mitra bisnis kuliner' })
  getCourses() {
    return this.accountingService.getCourses();
  }

  @Post('learn/quiz/submit')
  @ApiOperation({ summary: 'Submit jawaban kuis uji kompetensi & evaluasi syarat e-sertifikat (>80%)' })
  submitQuiz(@Body() dto: QuizSubmissionDto) {
    return this.accountingService.submitQuiz(dto);
  }

  @Get('learn/workshops')
  @ApiOperation({ summary: 'Daftar jadwal workshop & pelatihan tatap muka offline' })
  getWorkshops() {
    return this.accountingService.getWorkshops();
  }

  @Post('learn/workshops/register')
  @ApiOperation({ summary: 'Pendaftaran mitra ke workshop tatap muka offline' })
  registerWorkshop(@Body() dto: WorkshopRegistrationDto) {
    return this.accountingService.registerWorkshop(dto);
  }

  @Get('learn/certificates/:memberId')
  @ApiOperation({ summary: 'Daftar e-sertifikat digital kelulusan ber-QR Code milik member' })
  getCertificates(@Param('memberId') memberId: string) {
    return this.accountingService.getCertificates(memberId);
  }
}
