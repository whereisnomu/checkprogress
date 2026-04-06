import type {
  Skill,
  SkillRepository,
  SkillStage,
  SkillStageProgress,
} from '@progress-state/shared';

import type { SqliteDatabase } from './database';

type SkillRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
};

type SkillStageRow = {
  id: string;
  skill_id: string;
  title: string;
  description: string | null;
  stage_order: number;
  created_at: string;
};

type SkillStageProgressRow = {
  id: string;
  skill_stage_id: string;
  achieved_at: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

const mapSkillRow = (row: SkillRow): Skill => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapSkillStageRow = (row: SkillStageRow): SkillStage => ({
  id: row.id,
  skillId: row.skill_id,
  title: row.title,
  description: row.description,
  order: row.stage_order,
  createdAt: row.created_at,
});

const mapSkillStageProgressRow = (
  row: SkillStageProgressRow,
): SkillStageProgress => ({
  id: row.id,
  skillStageId: row.skill_stage_id,
  achievedAt: row.achieved_at,
  note: row.note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class SqliteSkillRepository implements SkillRepository {
  public constructor(private readonly database: SqliteDatabase) {}

  public async createSkill(skill: Skill) {
    this.database
      .prepare(
        `
          INSERT INTO skills (id, title, description, category, created_at, updated_at)
          VALUES (@id, @title, @description, @category, @createdAt, @updatedAt)
        `,
      )
      .run(skill);
  }

  public async listSkills() {
    const rows = this.database
      .prepare(
        `
          SELECT id, title, description, category, created_at, updated_at
          FROM skills
          ORDER BY created_at DESC
        `,
      )
      .all() as SkillRow[];

    return rows.map(mapSkillRow);
  }

  public async findSkillById(id: string) {
    const row = this.database
      .prepare(
        `
          SELECT id, title, description, category, created_at, updated_at
          FROM skills
          WHERE id = ?
        `,
      )
      .get(id) as SkillRow | undefined;

    return row ? mapSkillRow(row) : null;
  }

  public async updateSkill(skill: Skill) {
    this.database
      .prepare(
        `
          UPDATE skills
          SET title = @title,
              description = @description,
              category = @category,
              updated_at = @updatedAt
          WHERE id = @id
        `,
      )
      .run(skill);
  }

  public async deleteSkill(id: string) {
    this.database.prepare('DELETE FROM skills WHERE id = ?').run(id);
  }

  public async createStage(stage: SkillStage) {
    this.database
      .prepare(
        `
          INSERT INTO skill_stages (id, skill_id, title, description, stage_order, created_at)
          VALUES (@id, @skillId, @title, @description, @order, @createdAt)
        `,
      )
      .run(stage);
  }

  public async listStagesBySkillId(skillId: string) {
    const rows = this.database
      .prepare(
        `
          SELECT id, skill_id, title, description, stage_order, created_at
          FROM skill_stages
          WHERE skill_id = ?
          ORDER BY stage_order ASC
        `,
      )
      .all(skillId) as SkillStageRow[];

    return rows.map(mapSkillStageRow);
  }

  public async findStageById(id: string) {
    const row = this.database
      .prepare(
        `
          SELECT id, skill_id, title, description, stage_order, created_at
          FROM skill_stages
          WHERE id = ?
        `,
      )
      .get(id) as SkillStageRow | undefined;

    return row ? mapSkillStageRow(row) : null;
  }

  public async updateStage(stage: SkillStage) {
    this.database
      .prepare(
        `
          UPDATE skill_stages
          SET title = @title,
              description = @description,
              stage_order = @order
          WHERE id = @id
        `,
      )
      .run(stage);
  }

  public async deleteStage(id: string) {
    this.database.prepare('DELETE FROM skill_stages WHERE id = ?').run(id);
  }

  public async upsertStageProgress(progress: SkillStageProgress) {
    this.database
      .prepare(
        `
          INSERT INTO skill_stage_progress (
            id,
            skill_stage_id,
            achieved_at,
            note,
            created_at,
            updated_at
          )
          VALUES (
            @id,
            @skillStageId,
            @achievedAt,
            @note,
            @createdAt,
            @updatedAt
          )
          ON CONFLICT(skill_stage_id)
          DO UPDATE SET
            achieved_at = excluded.achieved_at,
            note = excluded.note,
            updated_at = excluded.updated_at
        `,
      )
      .run(progress);
  }

  public async findProgressByStageId(stageId: string) {
    const row = this.database
      .prepare(
        `
          SELECT id, skill_stage_id, achieved_at, note, created_at, updated_at
          FROM skill_stage_progress
          WHERE skill_stage_id = ?
        `,
      )
      .get(stageId) as SkillStageProgressRow | undefined;

    return row ? mapSkillStageProgressRow(row) : null;
  }

  public async listProgressBySkillId(skillId: string) {
    const rows = this.database
      .prepare(
        `
          SELECT p.id, p.skill_stage_id, p.achieved_at, p.note, p.created_at, p.updated_at
          FROM skill_stage_progress p
          INNER JOIN skill_stages s ON s.id = p.skill_stage_id
          WHERE s.skill_id = ?
        `,
      )
      .all(skillId) as SkillStageProgressRow[];

    return rows.map(mapSkillStageProgressRow);
  }
}
