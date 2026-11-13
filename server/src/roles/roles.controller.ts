import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionsDto } from './dto/assign-permission.dto';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Roles')
@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get('permissions')
  @Permissions('roles:manage')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }
@Get('roles')
@Permissions('roles:manage')
@SkipThrottle()
findAllRoles() {
  return this.rolesService.findAllRoles();
}

  @Get('roles/:id')
  @Permissions('roles:manage')
  findOneRole(@Param('id') id: string) {
    return this.rolesService.findOneRole(id);
  }

  @Post('roles')
  @Permissions('roles:manage')
  createRole(@Body() dto: CreateRoleDto, @Request() req) {
    return this.rolesService.createRole(dto, req.user.id);
  }

  @Delete('roles/:id')
  @Permissions('roles:manage')
  deleteRole(@Param('id') id: string, @Request() req) {
    return this.rolesService.deleteRole(id, req.user.id);
  }

  @Patch('roles/:id/permissions')
  @Permissions('roles:manage')
  setRolePermissions(@Param('id') id: string, @Body() dto: AssignPermissionsDto, @Request() req) {
    return this.rolesService.setRolePermissions(id, dto, req.user.id);
  }

  @Patch('users/:id/role')
  @Permissions('roles:manage')
  assignRoleToUser(@Param('id') id: string, @Body() dto: AssignRoleDto, @Request() req) {
    return this.rolesService.assignRoleToUser(id, dto, req.user.id);
  }
}