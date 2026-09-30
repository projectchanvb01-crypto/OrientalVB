import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { WmsService } from './wms.service';
import { BatchWarningLevel, LandedCostInput } from '@oriental/types';

@Controller('wms')
export class WmsController {
  constructor(private readonly wmsService: WmsService) {}

  // 1. FEFO & Product Batches
  @Get('batches')
  getBatches(@Query('warningLevel') warningLevel?: BatchWarningLevel) {
    return {
      success: true,
      data: this.wmsService.getBatches(warningLevel),
    };
  }

  @Post('batches')
  createBatch(
    @Body()
    dto: {
      productId: string;
      productName: string;
      sku: string;
      batchNumber: string;
      expiryDate: string;
      stockQty: number;
      costPrice: number;
      supplierName?: string;
    },
  ) {
    const batch = this.wmsService.createBatch(dto);
    return {
      success: true,
      message: 'Batch produk & tanggal kedaluwarsa berhasil dicatat (FEFO Engine)',
      data: batch,
    };
  }

  @Get('warning-summary')
  getWarningLevelSummary() {
    return {
      success: true,
      data: this.wmsService.getWarningLevelSummary(),
    };
  }

  // 2. Dynamic Unit Conversions
  @Get('conversions')
  getConversions(@Query('productId') productId?: string) {
    return {
      success: true,
      data: this.wmsService.getConversions(productId),
    };
  }

  @Post('conversions')
  createConversion(
    @Body()
    dto: {
      productId: string;
      unitName: string;
      multiplierQty: number;
      barcode?: string;
      isDefaultB2b?: boolean;
      priceEstimate?: number;
    },
  ) {
    const conv = this.wmsService.createConversion(dto);
    return {
      success: true,
      message: 'Satuan konversi dinamis berhasil ditambahkan',
      data: conv,
    };
  }

  @Delete('conversions/:id')
  deleteConversion(@Param('id') id: string) {
    const success = this.wmsService.deleteConversion(id);
    return {
      success,
      message: success ? 'Satuan konversi dihapus' : 'Gagal menemukan konversi',
    };
  }

  // 3. Suppliers & Shipping Routes
  @Get('suppliers')
  getSuppliers() {
    return {
      success: true,
      data: this.wmsService.getSuppliers(),
    };
  }

  @Post('suppliers')
  createSupplier(@Body() dto: any) {
    const sup = this.wmsService.createSupplier(dto);
    return {
      success: true,
      message: 'Data master supplier berhasil didaftarkan',
      data: sup,
    };
  }

  @Get('shipping-routes')
  getShippingRoutes() {
    return {
      success: true,
      data: this.wmsService.getShippingRoutes(),
    };
  }

  @Post('shipping-routes')
  createShippingRoute(@Body() dto: any) {
    const route = this.wmsService.createShippingRoute(dto);
    return {
      success: true,
      message: 'Rute ekspedisi laut & tarif CBM berhasil didaftarkan',
      data: route,
    };
  }

  // 4. Landed Cost Calculator (Antar-Pulau Sea Freight CBM)
  @Post('landed-cost/calculate')
  calculateLandedCost(@Body() input: LandedCostInput) {
    const result = this.wmsService.calculateLandedCost(input);
    return {
      success: true,
      message: 'Kalkulasi Landed Cost CBM berhasil dihitung',
      data: result,
    };
  }

  // 5. Supplier Comparison
  @Get('compare-suppliers/:productId')
  compareSuppliers(@Param('productId') productId: string) {
    const comparisons = this.wmsService.compareSuppliers(productId);
    return {
      success: true,
      data: comparisons,
    };
  }
}
