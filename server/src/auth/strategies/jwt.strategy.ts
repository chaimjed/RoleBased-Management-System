import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }
async validate(payload: { sub: string; email: string }) {
  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    include: {
      role: { include: { rolepermission: { include: { permission: true } } } },
    },
  });
  if (!user) throw new UnauthorizedException();
  if (user.status !== 'ACTIVE') throw new UnauthorizedException();
    const staleThresholdMs = 5 * 60 * 1000; // 5 min
    if (!user.lastActiveAt || Date.now() - user.lastActiveAt.getTime() > staleThresholdMs) {
      this.prisma.user
        .update({ where: { id: user.id }, data: { lastActiveAt: new Date() } })
        .catch(() => {}); 
    }

  return {
    ...user,
    permissions: user.role.rolepermission.map((rp) => rp.permission.name),
  };
}
}
