import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  CreatePriceSheetDto,
  UpdatePriceSheetDto,
} from './dto/create-price-sheet.dto';

@Controller('pricing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('sheets')
  findAll() {
    return this.pricingService.findAll();
  }

  @Get('sheets/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pricingService.findById(id);
  }

  @Post('sheets')
  create(@Body() dto: CreatePriceSheetDto) {
    return this.pricingService.create(dto);
  }

  @Patch('sheets/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePriceSheetDto,
  ) {
    return this.pricingService.update(id, dto);
  }

  @Delete('sheets/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.pricingService.remove(id);
  }
}
