import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WhiteLabelService } from './whitelabel.service';

@ApiTags('White Label Production & B2B Supply')
@Controller('white-label')
export class WhiteLabelController {
  constructor(private readonly whiteLabelService: WhiteLabelService) {}

  @Get('vendors')
  @ApiOperation({ summary: 'Daftar vendor pabrikan & izin legalitas (PIRT, BPOM, Halal)' })
  getVendors() {
    return this.whiteLabelService.getVendors();
  }

  @Post('vendors')
  @ApiOperation({ summary: 'Registrasi vendor pabrik maklon baru' })
  registerVendor(@Body() body: any) {
    return this.whiteLabelService.registerVendor(body);
  }

  @Get('contracts')
  @ApiOperation({ summary: 'Daftar kontrak maklon produksi merek khusus' })
  getContracts() {
    return this.whiteLabelService.getContracts();
  }

  @Post('contracts')
  @ApiOperation({ summary: 'Pembuatan kontrak maklon baru' })
  createContract(@Body() body: any) {
    return this.whiteLabelService.createContract(body);
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Katalog produk maklon untuk pasokan B2B UKM Supply' })
  getCatalog() {
    return this.whiteLabelService.getCatalogProducts();
  }

  @Get('batch-receipts')
  @ApiOperation({ summary: 'Riwayat penerimaan batch produksi (GRN)' })
  getBatchReceipts() {
    return this.whiteLabelService.getBatchReceipts();
  }

  @Post('receive-batch')
  @ApiOperation({ summary: 'Penerimaan batch produksi dan QC pass' })
  receiveBatch(@Body() body: any) {
    return this.whiteLabelService.receiveBatch(body);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Riwayat pemesanan produk maklon oleh B2B UKM Supply' })
  getOrders() {
    return this.whiteLabelService.getB2BOrders();
  }

  @Post('order')
  @ApiOperation({ summary: 'Order produk maklon oleh customer B2B UKM (Rp 10.000 = 1 Poin)' })
  orderProduct(@Body() body: any) {
    return this.whiteLabelService.orderWhiteLabelProduct(body);
  }
}
