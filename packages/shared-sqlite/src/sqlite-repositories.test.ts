import { describe, expect, it } from 'vitest';

import {
  clearDraft,
  getDraft,
  upsertDraft,
} from '../../../apps/bot/src/infra/draft-store';
import { openDatabase } from './database';
import { runMigrations } from './migrations';
import { SqliteRoutineRepository } from './sqlite-routine-repository';
import { SqliteSkillRepository } from './sqlite-skill-repository';
import { SqliteTaskRepository } from './sqlite-task-repository';
import { SqliteTelegramLinkRepository } from './sqlite-telegram-link-repository';

const createDatabase = () => {
  const database = openDatabase({
    sqlitePath: ':memory:',
    sqliteBusyTimeoutMs: 5000,
  });
  runMigrations(database, '2026-04-06T10:00:00.000Z');
  return database;
};

describe('shared-sqlite repositories', () => {
  it('applies migrations including bot/linking tables', () => {
    const database = createDatabase();

    const tables = (
      database
        .prepare("SELECT name FROM sqlite_master WHERE type='table'")
        .all() as Array<{ name: string }>
    ).map((row) => row.name);

    expect(tables).toContain('tasks');
    expect(tables).toContain('routines');
    expect(tables).toContain('skills');
    expect(tables).toContain('telegram_link_tokens');
    expect(tables).toContain('telegram_links');
    expect(tables).toContain('bot_drafts');
  });

  it('persists task records', async () => {
    const database = createDatabase();
    const repository = new SqliteTaskRepository(database);

    await repository.create({
      id: 'task-1',
      title: 'Task',
      description: null,
      status: 'todo',
      createdAt: '2026-04-06T10:00:00.000Z',
      updatedAt: '2026-04-06T10:00:00.000Z',
      completedAt: null,
    });

    const task = await repository.findById('task-1');
    expect(task?.title).toBe('Task');
  });

  it('persists routine entries and range queries', async () => {
    const database = createDatabase();
    const repository = new SqliteRoutineRepository(database);

    await repository.create({
      id: 'routine-1',
      title: 'Routine',
      description: null,
      frequency: 'daily',
      targetPerPeriod: 1,
      createdAt: '2026-04-06T10:00:00.000Z',
      updatedAt: '2026-04-06T10:00:00.000Z',
    });

    await repository.upsertEntry({
      id: 'entry-1',
      routineId: 'routine-1',
      date: '2026-04-06',
      status: 'done',
      note: null,
      createdAt: '2026-04-06T10:00:00.000Z',
      updatedAt: '2026-04-06T10:00:00.000Z',
    });

    const entries = await repository.listEntriesInRange(
      '2026-04-01',
      '2026-04-07',
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]?.routineId).toBe('routine-1');
  });

  it('persists skills, stages, and stage progress', async () => {
    const database = createDatabase();
    const repository = new SqliteSkillRepository(database);

    await repository.createSkill({
      id: 'skill-1',
      title: 'Skill',
      description: null,
      category: 'General',
      createdAt: '2026-04-06T10:00:00.000Z',
      updatedAt: '2026-04-06T10:00:00.000Z',
    });

    await repository.createStage({
      id: 'stage-1',
      skillId: 'skill-1',
      title: 'Stage',
      description: null,
      order: 1,
      createdAt: '2026-04-06T10:00:00.000Z',
    });

    await repository.upsertStageProgress({
      id: 'progress-1',
      skillStageId: 'stage-1',
      achievedAt: '2026-04-06T10:00:00.000Z',
      note: null,
      createdAt: '2026-04-06T10:00:00.000Z',
      updatedAt: '2026-04-06T10:00:00.000Z',
    });

    const stages = await repository.listStagesBySkillId('skill-1');
    const progress = await repository.findProgressByStageId('stage-1');

    expect(stages).toHaveLength(1);
    expect(progress?.skillStageId).toBe('stage-1');
  });

  it('persists telegram link tokens and linked chat', async () => {
    const database = createDatabase();
    const repository = new SqliteTelegramLinkRepository(database);

    await repository.createLinkToken({
      code: 'ABCD1234',
      createdAt: '2026-04-06T10:00:00.000Z',
      expiresAt: '2026-04-06T10:30:00.000Z',
      consumedAt: null,
    });

    const token = await repository.getActiveLinkToken(
      'ABCD1234',
      '2026-04-06T10:10:00.000Z',
    );
    expect(token?.code).toBe('ABCD1234');

    await repository.upsertLinkedChat({
      chatId: '770895912',
      userId: '770895912',
      linkedAt: '2026-04-06T10:11:00.000Z',
    });

    const linkedChat = await repository.getLinkedChat();
    expect(linkedChat?.chatId).toBe('770895912');
  });

  it('persists and clears bot drafts', () => {
    const database = createDatabase();

    upsertDraft(database, {
      chatId: '770895912',
      kind: 'new_routine',
      payloadJson: JSON.stringify({ step: 'title' }),
      updatedAt: '2026-04-06T10:00:00.000Z',
    });

    const draft = getDraft(database, '770895912');
    expect(draft?.kind).toBe('new_routine');

    clearDraft(database, '770895912');
    expect(getDraft(database, '770895912')).toBeNull();
  });
});
