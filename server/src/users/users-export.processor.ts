import { Processor, WorkerHost } from "@nestjs/bullmq";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "./users.service";
import { NotificationsService } from "../notifications/notifications.service";
import { Job } from "bullmq";
import path from "path";
import * as fs from 'fs';
import cloudinary from "../cloudinary/cloudinary.config";

@Processor('user-exports')
export class UsersExportProcessor extends WorkerHost {

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { search, role, status, joinedAfter, requesterId, notificationId } = job.data;

    const dir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    const filePath = path.join(dir, `export-${job.id}.csv`);
    const stream = fs.createWriteStream(filePath);
    stream.write('First name,Last name,Email,Phone,Verified,Status,Role,Joined,Last active\n');

    const where = this.usersService.filterExport(search, role, status, joinedAfter);

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isVerified: true,
        status: true,
        createdAt: true,
        lastActiveAt: true,
        role: { select: { name: true } },
      },
    });

    for (const u of users) {
      stream.write(`${u.firstName},${u.lastName},${u.email},${u.phone ?? ''},${u.isVerified},${u.status},${u.role.name},${u.createdAt.toISOString()},${u.lastActiveAt?.toISOString() ?? ''}\n`);
    }
    const total = users.length;
    await job.updateProgress(total);

    stream.end();
    await new Promise<void>((resolve) => stream.on('finish', resolve));

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: 'user-exports',
      public_id: `export-${job.id}`,
      format: 'csv',
    });
    fs.unlinkSync(filePath);

    await this.notificationsService.update(notificationId, {
      type: 'EXPORT_READY',
      message: `Your export of ${total} users is ready to download`,
      data: { jobId: job.id, status: 'ready', fileUrl: uploadResult.secure_url },
      isRead: false,
    });

    return { fileUrl: uploadResult.secure_url, total };
  }
}