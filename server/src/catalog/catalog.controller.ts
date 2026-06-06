import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../types/user.types';
import { UsersService } from '../users/users.service';

@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly usersService: UsersService,
  ) {}

  @Get('products')
  async getProducts(
    @CurrentUser() jwtUser: JwtPayload,
    @Query('q') query?: string,
  ) {
    const user = await this.usersService.findById(jwtUser.sub);
    const pricingSheetId = user?.role === 'client' ? user.pricingSheetId : null;
    const customerType =
      user?.role === 'client' ? user.customerType ?? undefined : undefined;

    if (query) {
      return this.catalogService.searchProducts(query, pricingSheetId, customerType);
    }

    return this.catalogService.getProducts(pricingSheetId, customerType);
  }

  @Get('products/:id')
  async getProductById(
    @Param('id') id: string,
    @CurrentUser() jwtUser: JwtPayload,
  ) {
    const user = await this.usersService.findById(jwtUser.sub);
    const pricingSheetId = user?.role === 'client' ? user.pricingSheetId : null;
    const customerType =
      user?.role === 'client' ? user.customerType ?? undefined : undefined;

    return this.catalogService.getProductById(id, pricingSheetId, customerType);
  }
}
