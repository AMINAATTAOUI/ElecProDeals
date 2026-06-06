import { Controller, Get, Patch, Delete, Param, Body, UseGuards, ForbiddenException, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService, UpdateUserDto } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // RGPD — droit à l'oubli (admin uniquement)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  // RGPD — export données (admin ou propre compte)
  @Get(':id/export')
  exportData(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.exportUserData(id);
  }
}

