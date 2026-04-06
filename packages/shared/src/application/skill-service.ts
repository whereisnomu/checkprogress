import { z } from 'zod';

import {
  createSkill,
  createSkillStage,
  createSkillStageProgress,
  updateSkill,
  updateSkillStage,
  updateSkillStageProgress,
} from '../domain/skill';
import type { Clock, IdGenerator, SkillRepository } from './ports';

export class SkillNotFoundError extends Error {
  public constructor(skillId: string) {
    super(`Skill ${skillId} was not found`);
    this.name = 'SkillNotFoundError';
  }
}

export class SkillStageNotFoundError extends Error {
  public constructor(stageId: string) {
    super(`Skill stage ${stageId} was not found`);
    this.name = 'SkillStageNotFoundError';
  }
}

export const createSkillInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(120).optional(),
});

export const createSkillStageInputSchema = z.object({
  skillId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  order: z.number().int().positive().max(1000),
});

export const markSkillStageInputSchema = z.object({
  stageId: z.string().min(1),
  achievedAt: z.string().datetime().optional(),
  note: z.string().trim().max(500).optional(),
});

export const updateSkillInputSchema = z.object({
  skillId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(120).optional(),
});

export const deleteSkillInputSchema = z.object({
  skillId: z.string().min(1),
});

export const updateSkillStageInputSchema = z.object({
  stageId: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  order: z.number().int().positive().max(1000),
});

export const deleteSkillStageInputSchema = z.object({
  stageId: z.string().min(1),
});

export type CreateSkillInput = z.infer<typeof createSkillInputSchema>;
export type CreateSkillStageInput = z.infer<typeof createSkillStageInputSchema>;
export type MarkSkillStageInput = z.infer<typeof markSkillStageInputSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillInputSchema>;
export type DeleteSkillInput = z.infer<typeof deleteSkillInputSchema>;
export type UpdateSkillStageInput = z.infer<typeof updateSkillStageInputSchema>;
export type DeleteSkillStageInput = z.infer<typeof deleteSkillStageInputSchema>;

export type SkillProgressSummary = {
  totalSkills: number;
  totalStages: number;
  completedStages: number;
  completionRate: number;
};

export class SkillService {
  public constructor(
    private readonly repository: SkillRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  public async createSkill(input: CreateSkillInput) {
    const validated = createSkillInputSchema.parse(input);
    const now = this.clock.now();
    const skill = createSkill({
      id: this.idGenerator.next(),
      title: validated.title,
      description: validated.description ?? null,
      category: validated.category ?? null,
      now,
    });

    await this.repository.createSkill(skill);

    return skill;
  }

  public async listSkills() {
    return this.repository.listSkills();
  }

  public async listStagesBySkillId(skillId: string) {
    return this.repository.listStagesBySkillId(skillId);
  }

  public async updateSkill(input: UpdateSkillInput) {
    const validated = updateSkillInputSchema.parse(input);
    const skill = await this.repository.findSkillById(validated.skillId);

    if (!skill) {
      throw new SkillNotFoundError(validated.skillId);
    }

    const updated = updateSkill(skill, {
      title: validated.title,
      description: validated.description ?? null,
      category: validated.category ?? null,
      now: this.clock.now(),
    });

    await this.repository.updateSkill(updated);

    return updated;
  }

  public async deleteSkill(input: DeleteSkillInput) {
    const validated = deleteSkillInputSchema.parse(input);
    const skill = await this.repository.findSkillById(validated.skillId);

    if (!skill) {
      throw new SkillNotFoundError(validated.skillId);
    }

    await this.repository.deleteSkill(validated.skillId);
  }

  public async createStage(input: CreateSkillStageInput) {
    const validated = createSkillStageInputSchema.parse(input);
    const skill = await this.repository.findSkillById(validated.skillId);

    if (!skill) {
      throw new SkillNotFoundError(validated.skillId);
    }

    const stage = createSkillStage({
      id: this.idGenerator.next(),
      skillId: validated.skillId,
      title: validated.title,
      description: validated.description ?? null,
      order: validated.order,
      now: this.clock.now(),
    });

    await this.repository.createStage(stage);

    return stage;
  }

  public async updateStage(input: UpdateSkillStageInput) {
    const validated = updateSkillStageInputSchema.parse(input);
    const stage = await this.repository.findStageById(validated.stageId);

    if (!stage) {
      throw new SkillStageNotFoundError(validated.stageId);
    }

    const updated = updateSkillStage(stage, {
      title: validated.title,
      description: validated.description ?? null,
      order: validated.order,
    });

    await this.repository.updateStage(updated);

    return updated;
  }

  public async deleteStage(input: DeleteSkillStageInput) {
    const validated = deleteSkillStageInputSchema.parse(input);
    const stage = await this.repository.findStageById(validated.stageId);

    if (!stage) {
      throw new SkillStageNotFoundError(validated.stageId);
    }

    await this.repository.deleteStage(validated.stageId);
  }

  public async markStage(input: MarkSkillStageInput) {
    const validated = markSkillStageInputSchema.parse(input);
    const stage = await this.repository.findStageById(validated.stageId);

    if (!stage) {
      throw new SkillStageNotFoundError(validated.stageId);
    }

    const now = this.clock.now();
    const progress = await this.repository.findProgressByStageId(
      validated.stageId,
    );
    const achievedAt = validated.achievedAt ?? now;

    const nextProgress = progress
      ? updateSkillStageProgress(progress, {
          achievedAt,
          note: validated.note ?? null,
          now,
        })
      : createSkillStageProgress({
          id: this.idGenerator.next(),
          skillStageId: validated.stageId,
          achievedAt,
          note: validated.note ?? null,
          now,
        });

    await this.repository.upsertStageProgress(nextProgress);

    return nextProgress;
  }

  public async getProgressSummary(): Promise<SkillProgressSummary> {
    const skills = await this.repository.listSkills();
    let totalStages = 0;
    let completedStages = 0;

    for (const skill of skills) {
      const [stages, progress] = await Promise.all([
        this.repository.listStagesBySkillId(skill.id),
        this.repository.listProgressBySkillId(skill.id),
      ]);

      totalStages += stages.length;
      completedStages += progress.length;
    }

    return {
      totalSkills: skills.length,
      totalStages,
      completedStages,
      completionRate: totalStages === 0 ? 0 : completedStages / totalStages,
    };
  }
}
