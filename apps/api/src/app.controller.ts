import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Status and Service Directory' })
  getRoot() {
    return {
      status: 'online',
      name: 'Oriental Digital Ecosystem API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      docs: '/api/docs',
      modules: {
        auth: '/api/v1/auth',
        members: '/api/v1/members',
        pos: '/api/v1/pos',
        waste: '/api/v1/waste',
        referral: '/api/v1/referral',
        accounting: '/api/v1/accounting',
        whiteLabel: '/api/v1/white-label',
        wms: '/api/v1/wms',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'System Health Check' })
  getHealth() {
    return {
      status: 'healthy',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
