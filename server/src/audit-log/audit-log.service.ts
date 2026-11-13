import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { labelForKey } from './audit-log.constants';

interface LogEntryInput {
  actorId?: string | null;
  key: string;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

 async log(input: LogEntryInput) {
    const { actorId, ...rest } = input;

    return this.prisma.auditLog.create({
      data: {
        ...rest,
        action: labelForKey(input.key),
        ...(actorId
          ? { actor: { connect: { id: actorId } } }
          : {}),
      },
    });
  }

  async findAll(filters: { actorId?: string; key?: string; targetId?: string }, page = 1, limit = 25) {
    const where: any = {};
    if (filters.actorId) where.actorId = filters.actorId;
    if (filters.key) where.key = filters.key;
    if (filters.targetId) where.targetId = filters.targetId;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { actor: { select: { firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}