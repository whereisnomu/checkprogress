import { z } from 'zod';

import type { Clock, IdGenerator, TelegramLinkRepository } from './ports';

export class TelegramLinkError extends Error {}

export const linkTelegramInputSchema = z.object({
  code: z.string().trim().min(4).max(32),
  chatId: z.string().min(1),
  userId: z.string().optional(),
});

export class TelegramLinkService {
  public constructor(
    private readonly repository: TelegramLinkRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  public async generateLinkCode() {
    const now = this.clock.now();
    const code = this.idGenerator
      .next()
      .replace(/-/g, '')
      .slice(0, 8)
      .toUpperCase();

    const expiresAtDate = new Date(now);
    expiresAtDate.setMinutes(expiresAtDate.getMinutes() + 30);

    await this.repository.createLinkToken({
      code,
      createdAt: now,
      expiresAt: expiresAtDate.toISOString(),
      consumedAt: null,
    });

    return {
      code,
      createdAt: now,
      expiresAt: expiresAtDate.toISOString(),
    };
  }

  public async linkTelegram(input: z.infer<typeof linkTelegramInputSchema>) {
    const validated = linkTelegramInputSchema.parse(input);
    const now = this.clock.now();
    const token = await this.repository.getActiveLinkToken(validated.code, now);

    if (!token) {
      throw new TelegramLinkError('Link code is invalid or expired');
    }

    await this.repository.upsertLinkedChat({
      chatId: validated.chatId,
      userId: validated.userId ?? null,
      linkedAt: now,
    });
    await this.repository.consumeLinkToken(validated.code, now);

    return {
      chatId: validated.chatId,
      userId: validated.userId ?? null,
      linkedAt: now,
    };
  }

  public async getLinkStatus() {
    const [linkedChat, latestLinkToken] = await Promise.all([
      this.repository.getLinkedChat(),
      this.repository.getLatestLinkToken(),
    ]);

    return {
      linkedChat,
      latestLinkToken,
    };
  }
}
