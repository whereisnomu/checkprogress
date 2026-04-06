import type { SqliteDatabase } from '@progress-state/shared-sqlite';

export type BotDraft = {
  chatId: string;
  kind: string;
  payloadJson: string;
  updatedAt: string;
};

export const getDraft = (
  database: SqliteDatabase,
  chatId: string,
): BotDraft | null => {
  const row = database
    .prepare(
      `
        SELECT chat_id, kind, payload_json, updated_at
        FROM bot_drafts
        WHERE chat_id = ?
      `,
    )
    .get(chatId) as
    | {
        chat_id: string;
        kind: string;
        payload_json: string;
        updated_at: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    chatId: row.chat_id,
    kind: row.kind,
    payloadJson: row.payload_json,
    updatedAt: row.updated_at,
  };
};

export const upsertDraft = (database: SqliteDatabase, draft: BotDraft) => {
  database
    .prepare(
      `
        INSERT INTO bot_drafts (chat_id, kind, payload_json, updated_at)
        VALUES (@chatId, @kind, @payloadJson, @updatedAt)
        ON CONFLICT(chat_id)
        DO UPDATE SET
          kind = excluded.kind,
          payload_json = excluded.payload_json,
          updated_at = excluded.updated_at
      `,
    )
    .run(draft);
};

export const clearDraft = (database: SqliteDatabase, chatId: string) => {
  database.prepare('DELETE FROM bot_drafts WHERE chat_id = ?').run(chatId);
};
