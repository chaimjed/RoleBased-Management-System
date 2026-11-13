import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BullModule } from '@nestjs/bullmq';
import { UsersExportProcessor } from './users-export.processor';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuthModule, MailModule,NotificationsModule,AuditLogModule,BullModule.registerQueue({ name: 'user-exports' }),
],
  controllers: [UsersController],
  providers: [UsersService,UsersExportProcessor],
  exports: [UsersService],})
export class UsersModule {}
