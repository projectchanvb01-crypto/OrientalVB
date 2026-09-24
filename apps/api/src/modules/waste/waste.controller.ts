import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WasteService } from './waste.service';

@ApiTags('Waste Purchasing & Profit Sharing')
@Controller('waste')
export class WasteController {
  constructor(private readonly wasteService: WasteService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Daftar komoditas limbah (Minyak Jelantah focus)' })
  getCategories() {
    return this.wasteService.getCategories();
  }

  @Get('partners')
  @ApiOperation({ summary: 'Daftar mitra penyedia tempat (Drop Point) & saldo bagi hasil 10%' })
  getPartners() {
    return this.wasteService.getPartners();
  }

  @Get('history')
  @ApiOperation({ summary: 'Riwayat transaksi timbangan dan pembelian limbah' })
  getHistory() {
    return this.wasteService.getHistory();
  }

  @Post('record-purchase')
  @ApiOperation({ summary: 'Pencatatan pembelian limbah, mutasi poin 1 kg = 1 pt & bagi hasil tempat 10%' })
  recordPurchase(@Body() body: any) {
    return this.wasteService.recordPurchase(body);
  }
}

