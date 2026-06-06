import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../types/user.types';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  async getInvoices(@CurrentUser() user: JwtPayload) {
    return this.invoicesService.getInvoices(user.sub);
  }

  @Get('quotes')
  async getQuotes(@CurrentUser() user: JwtPayload) {
    return this.invoicesService.getQuotes(user.sub);
  }
}
