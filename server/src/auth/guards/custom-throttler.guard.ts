import { ExecutionContext } from "@nestjs/common";
import { ThrottlerException, ThrottlerGuard, ThrottlerLimitDetail } from "@nestjs/throttler";

export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    const handler = context.getHandler().name;

    if (handler === 'login') {
      throw new ThrottlerException('Too many login attempts. Please wait a minute and try again.');
    }

    throw new ThrottlerException('Too many requests. Please slow down and try again shortly.');
  }
}