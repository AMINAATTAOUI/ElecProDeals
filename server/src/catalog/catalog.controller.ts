import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload, ClientUser } from '../types/user.types';
import { UsersService } from '../users/users.service';

@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly usersService: UsersService,
  ) {}

  @Get('products')
  getProducts(
    @CurrentUser() jwtUser: JwtPayload,
    @Query('q') query?: string,
  ) {
    const user = this.usersService.findById(jwtUser.sub);
    const customerType =
      user?.role === 'client' ? (user as ClientUser).customerType : undefined;

    if (query) {
      return this.catalogService.searchProducts(query, customerType);
    }

    return this.catalogService.getProducts(customerType);
  }

  @Get('products/:id')
  getProductById(
    @Param('id') id: string,
    @CurrentUser() jwtUser: JwtPayload,
  ) {
    const user = this.usersService.findById(jwtUser.sub);
    const customerType =
      user?.role === 'client' ? (user as ClientUser).customerType : undefined;

    return this.catalogService.getProductById(id, customerType);
  }
}

