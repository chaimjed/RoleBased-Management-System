import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService:NotificationsService,
    private auditLogService: AuditLogService,

  ) {}
async create(dto: CreateUserDto, actorId: string) {
  const existing = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });
  if (existing) {
    throw new ConflictException(
      'An account already exists with this email address.',
    );
  }

  const role = await this.prisma.role.findUnique({
    where: { id: dto.roleId },
  });
  if (!role) {
    throw new BadRequestException('Role not found');
  }

  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = await this.prisma.user.create({
    data: {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      dateOfBirth: new Date(dto.dateOfBirth),
      password: hashedPassword,
      isVerified: true,
      roleId: dto.roleId,
    },
  });

  await this.auditLogService.log({
    actorId,
    key: 'USER_CREATED',
    targetType: 'User',
    targetId: user.id,
    targetLabel: `${user.firstName} ${user.lastName}`,
    metadata: { email: user.email, roleId: dto.roleId },
  });

  const { password, refreshToken, verificationToken, resetToken, ...result } =
    user;
  return result;
}
  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    role?: string,
    status?: string,
    joinedAfter?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (role && role !== 'ALL') {
      where.role = { name: role };
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (joinedAfter) {
      where.createdAt = { gte: new Date(joinedAfter) };
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isVerified: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
          lastActiveAt: true,
          role: { select: { name: true } },
          statusReason: true,
          suspendedUntil: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => ({ ...u, role: u.role.name })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isVerified: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        lastActiveAt: true,
        role: { select: { name: true } },
        statusReason: true,
        suspendedUntil: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { ...user, role: user.role.name };
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.findOne(id);

    const data: any = { ...dto };
    if (dto.email && dto.email !== existing.email) {
      data.isVerified = false;
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    const { password, refreshToken, verificationToken, resetToken, ...result } =
      user;
    return result;
  }

async remove(id: string, actorId: string) {
  const user = await this.findOne(id); 
  await this.prisma.user.delete({ where: { id } });

  await this.auditLogService.log({
    actorId,
    key: 'USER_DELETED',
    targetType: 'User',
    targetId: id,
    targetLabel: `${user.firstName} ${user.lastName}`,
  });

  return { message: 'User successfully deleted' };
}
  async updateStatus(
    id: string,
    dto: UpdateUserStatusDto,
    requesterId: string,
  ) {
    if (id === requesterId) {
      throw new ForbiddenException('You cannot change your own status');
    }

    const data: any = { status: dto.status };

    if (dto.status === 'ACTIVE') {
      data.statusReason = null;
      data.suspendedUntil = null;
    } else {
      data.statusReason = dto.reason;
      data.refreshToken = null;

      if (dto.status === 'SUSPENDED') {
        data.suspendedUntil = new Date(
          Date.now() + dto.delayDays! * 24 * 60 * 60 * 1000,
        );
      } else {
        data.suspendedUntil = null;
      }
    }

    const user = await this.prisma.user.update({ where: { id }, data });

    if (dto.status === 'SUSPENDED' || dto.status === 'BANNED') {
      await this.mailService.sendAccountStatusEmail(
        user.email,
        user.firstName ?? '',
        dto.status,
        dto.reason!,
        dto.status === 'SUSPENDED' ? data.suspendedUntil : undefined,
      );
       await this.notificationsService.create({
      userId: user.id,
      type: dto.status === 'SUSPENDED' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_BANNED',
      message:
        dto.status === 'SUSPENDED'
          ? `Your account has been suspended: ${dto.reason}`
          : `your account has been banned: ${dto.reason}`,
    });
  
    }
 await this.auditLogService.log({
    actorId: requesterId,
    key: `USER_${dto.status}`,
    targetType: 'User',
    targetId: id,
    targetLabel: `${user.firstName} ${user.lastName}`, 
    metadata: { reason: dto.reason, delayDays: dto.delayDays },
  });
    const { password, refreshToken, verificationToken, resetToken, ...result } =
      user;
    return result;
  }
filterExport(search?: string, role?: string, status?: string, joinedAfter?: string) {
  const where: any = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (role && role !== 'ALL') where.role = { name: role };
  if (status && status !== 'ALL') where.status = status;
  if (joinedAfter) where.createdAt = { gte: new Date(joinedAfter) };
  return where;
}
}
