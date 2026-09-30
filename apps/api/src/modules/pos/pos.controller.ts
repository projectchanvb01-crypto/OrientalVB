import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PosService } from './pos.service';
import { PosOrderCheckout } from '@oriental/types';

@ApiTags('POS Transactions (Retail & Grosir)')
@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Proses checkout transaksi POS (Retail B2C / Grosir B2B)' })
  checkout(@Body() order: Partial<PosOrderCheckout>) {
    return this.posService.processCheckout(order);
  }

  @Post('preview-3ply')
  @ApiOperation({ summary: 'Generate pratinjau teks nota 3 rangkap dot-matrix' })
  preview3Ply(
    @Body()
    body: {
      invoiceNumber: string;
      customerName: string;
      items: any[];
      grandTotal: number;
      channelType?: 'UKM_SUPPLY' | 'GROSIR';
      paymentType?: 'CASH' | 'TERMIN';
      termsPeriod?: string;
      dueDateStr?: string;
    },
  ) {
    return this.posService.generate3PlyNotaText(
      body.invoiceNumber,
      body.customerName,
      body.items,
      body.grandTotal,
      body.channelType,
      body.paymentType,
      body.termsPeriod,
      body.dueDateStr,
    );
  }

  @Post('sync-offline')
  @ApiOperation({ summary: 'Batch sinkronisasi transaksi offline dari PWA Dexie.js (Anti-Duplikasi)' })
  syncOffline(
    @Body()
    body: {
      transactions: any[];
      terminalId?: string;
    },
  ) {
    return this.posService.syncOfflineTransactions(body.transactions || [], body.terminalId);
  }
}
