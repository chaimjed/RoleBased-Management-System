import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateExportDto } from './dto/create-export.dto';
import { RunningCodeInNewContextOptions } from 'node:vm';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private notificationService: NotificationsService,
    @InjectQueue('user-exports') private exportQueue: Queue,
  ) {}

  @Get()
  @Permissions('users:read')
  @ApiOperation({ summary: 'List users' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('joinedAfter') joinedAfter?: string,
  ) {
    return this.usersService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
      role,
      status,
      joinedAfter,
    );
  }
@Post()
@Permissions('users:create')
@ApiOperation({ summary: 'Create a new user' })
create(@Body() dto: CreateUserDto, @Request() req) {
  return this.usersService.create(dto, req.user.id);
}
  @Get(':id')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Get one user by id' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions('users:edit')
  @ApiOperation({ summary: 'Update a user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
@Delete(':id')
@Permissions('users:delete')
@ApiOperation({ summary: 'Delete a user' })
remove(@Param('id') id: string, @Request() req) {
  return this.usersService.remove(id, req.user.id);
}
  @Post(':id/resend-verification')
  @Permissions('users:edit')
  @ApiOperation({ summary: "Resend the user's verification email" })
  resendVerification(@Param('id') id: string) {
    return this.authService.resendVerificationLinkByUserId(id).then(() => ({
      message: 'Verification email sent',
    }));
  }
  @Patch(':id/status')
  @Permissions('users:edit')
  @ApiOperation({ summary: "Update a user's status" })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Request() req,
  ) {
    return this.usersService.updateStatus(id, dto, req.user.id);
  }

  @Post('export')
  @Permissions('users:export')
  @ApiOperation({
    summary: 'Start a background export of users matching filters',
  })
  async startExport(@Body() dto: CreateExportDto, @Request() req) {
   
    const notification = await this.notificationService.create({
      userId: req.user.id,
      type: 'EXPORT_PREPARING',
      message: 'your export is being prepared...',
      data: {  status: 'preparing' },
    });
     const job = await this.exportQueue.add('export-users', {
      ...dto,
      requesterId: req.user.id,
      notificationId:notification.id
    });

    await this.notificationService.update(notification.id,{
      data:{jobId:job.id,status:'preparing'}
    })
    return { jobId: job.id, notificationId: notification.id };
  }
  @Get('export/:jobId/status')
  async getExportStatus(@Param('jobId') jobId: string) {
    const job = await this.exportQueue.getJob(jobId);
    if (!job) return { status: 'not_found' };
    return { status: await job.getState() };
  }

  @Get('export/:jobId/download')
  async downloadExport(@Param('jobId') jobId: string, @Res() res: Response) {
    const job = await this.exportQueue.getJob(jobId);
    const fileUrl = job?.returnvalue?.fileUrl;
    if (!fileUrl) {
    return res.status(404).json({ message: 'File not found or expired' });
  }
    res.redirect(fileUrl)
  }
}
