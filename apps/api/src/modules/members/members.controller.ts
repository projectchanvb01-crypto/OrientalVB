import { Controller, Get, Param, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { RegisterMemberDto } from '@oriental/types';

@ApiTags('Members & CRM One Identity')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar semua member Customer One Identity dengan pencarian dan filter' })
  async getAllMembers(
    @Query('q') query?: string,
    @Query('segment') segment?: string,
    @Query('region') region?: string,
  ) {
    return this.membersService.getAll(query, segment, region);
  }

  @Post('register')
  @ApiOperation({ summary: 'Pendaftaran member Customer One Identity baru (sesuai template form)' })
  async register(@Body() dto: RegisterMemberDto) {
    return this.membersService.register(dto);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Cari member berdasarkan Barcode ID, No Member, atau No WhatsApp' })
  async getMember(@Param('code') code: string) {
    const member = await this.membersService.findByCode(code);
    if (!member) {
      return { found: false, message: 'Member tidak ditemukan' };
    }
    return { found: true, data: member };
  }

  @Post('calculate-rewards')
  @ApiOperation({ summary: 'Kalkulasi poin transaksi dan kupon undian doorprize (5 Segmen Bisnis)' })
  calculateRewards(@Body() body: { channel: string; amount: number; weightKg?: number }) {
    return this.membersService.calculatePointsAndCoupons(body.channel, body.amount, body.weightKg || 0);
  }
}
