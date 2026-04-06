import type { TelegramLinkRepository } from '@progress-state/shared';

import type { SqliteDatabase } from './database';

export class SqliteTelegramLinkRepository implements TelegramLinkRepository {
  public constructor(private readonly database: SqliteDatabase) {}

  public async createLinkToken(token: {
    code: string;
    createdAt: string;
    expiresAt: string;
    consumedAt: string | null;
  }) {
    this.database
      .prepare(
        `
          INSERT INTO telegram_link_tokens (code, created_at, expires_at, consumed_at)
          VALUES (@code, @createdAt, @expiresAt, @consumedAt)
        `,
      )
      .run(token);
  }

  public async getActiveLinkToken(code: string, now: string) {
    const row = this.database
      .prepare(
        `
          SELECT code, created_at, expires_at, consumed_at
          FROM telegram_link_tokens
          WHERE code = ? AND consumed_at IS NULL AND expires_at >= ?
        `,
      )
      .get(code, now) as
      | {
          code: string;
          created_at: string;
          expires_at: string;
          consumed_at: string | null;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      code: row.code,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      consumedAt: row.consumed_at,
    };
  }

  public async consumeLinkToken(code: string, consumedAt: string) {
    this.database
      .prepare('UPDATE telegram_link_tokens SET consumed_at = ? WHERE code = ?')
      .run(consumedAt, code);
  }

  public async upsertLinkedChat(link: {
    chatId: string;
    userId: string | null;
    linkedAt: string;
  }) {
    this.database
      .prepare(
        `
          INSERT INTO telegram_links (id, chat_id, user_id, linked_at)
          VALUES (1, @chatId, @userId, @linkedAt)
          ON CONFLICT(id)
          DO UPDATE SET
            chat_id = excluded.chat_id,
            user_id = excluded.user_id,
            linked_at = excluded.linked_at
        `,
      )
      .run(link);
  }

  public async getLinkedChat() {
    const row = this.database
      .prepare(
        'SELECT chat_id, user_id, linked_at FROM telegram_links WHERE id = 1',
      )
      .get() as
      | {
          chat_id: string;
          user_id: string | null;
          linked_at: string;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      chatId: row.chat_id,
      userId: row.user_id,
      linkedAt: row.linked_at,
    };
  }

  public async getLatestLinkToken() {
    const row = this.database
      .prepare(
        `
          SELECT code, created_at, expires_at, consumed_at
          FROM telegram_link_tokens
          ORDER BY created_at DESC
          LIMIT 1
        `,
      )
      .get() as
      | {
          code: string;
          created_at: string;
          expires_at: string;
          consumed_at: string | null;
        }
      | undefined;

    if (!row) {
      return null;
    }

    return {
      code: row.code,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      consumedAt: row.consumed_at,
    };
  }
}
