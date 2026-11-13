import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionsDto } from './dto/assign-permission.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async findAllPermissions() {
  return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }

  private cleanRole(role: {
    id: string;
    name: string;
    rolepermission: { permission: { name: string } }[];
  }) {
    return {
      id: role.id,
      name: role.name,
      permissions: role.rolepermission.map((rp) => rp.permission.name),
    };
  }

  async findAllRoles() {
    const roles = await this.prisma.role.findMany({
      include: { rolepermission: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });
    return roles.map((r) => this.cleanRole(r));
  }

  async findOneRole(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { rolepermission: { include: { permission: true } } },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.cleanRole(role);
  }

  async createRole(dto: CreateRoleDto, actorId: string) {
    const existing = await this.prisma.role.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException('A role with this name already exists');
    const role = await this.prisma.role.create({ data: { name: dto.name } });

    await this.auditLogService.log({
      actorId,
      key: 'ROLE_CREATED',
      targetType: 'Role',
      targetId: role.id,
      targetLabel:role.name,
      metadata: { name: dto.name },
    });

    return this.cleanRole({ ...role, rolepermission: [] });
  }

  async assignRoleToUser(userId: string, dto: AssignRoleDto, actorId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { roleId: dto.roleId },
    });

    await this.auditLogService.log({
      actorId,
      key: 'USER_ROLE_ASSIGNED',
      targetType: 'User',
      targetId: userId,
      targetLabel:role.name,
      metadata: { roleId: dto.roleId, roleName: role.name },
    });

    const { password, refreshToken, verificationToken, resetToken, ...result } = user;
    return result;
  }

  async deleteRole(id: string, actorId: string) {
    const usersWithRole = await this.prisma.user.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      throw new BadRequestException('Cannot delete a role that is still assigned to users. Reassign them first');
    }
    const role = await this.findOneRole(id);

    await this.prisma.$transaction([
      this.prisma.rolepermission.deleteMany({ where: { roleId: id } }),
      this.prisma.role.delete({ where: { id } }),
    ]);

    await this.auditLogService.log({
      actorId,
      key: 'ROLE_DELETED',
      targetType: 'Role',
      targetId: id,
      targetLabel:role.name,
      metadata: { name: role.name },
    });

    return { message: 'Role successfully deleted' };
  }

  async setRolePermissions(roleId: string, dto: AssignPermissionsDto, actorId: string) {
    const before = await this.findOneRole(roleId);

    const permissions = await this.prisma.permission.findMany({
      where: { name: { in: dto.permissionNames } },
    });

    const foundNames = permissions.map((p) => p.name);
    const missing = dto.permissionNames.filter((n) => !foundNames.includes(n));
    if (missing.length > 0) {
      throw new BadRequestException(`Unknown permission name(s): ${missing.join(', ')}`);
    }

    await this.prisma.$transaction([
      this.prisma.rolepermission.deleteMany({ where: { roleId } }),
      this.prisma.rolepermission.createMany({
        data: permissions.map((p) => ({ roleId, permissionId: p.id })),
      }),
    ]);

    await this.auditLogService.log({
      actorId,
      key: 'ROLE_PERMISSIONS_UPDATED',
      targetType: 'Role',
      targetId: roleId,
      targetLabel: before.name, 
      metadata: { before: before.permissions, after: dto.permissionNames },
    });

    return this.findOneRole(roleId);
  }
}