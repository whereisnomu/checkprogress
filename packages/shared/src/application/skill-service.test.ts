import { describe, expect, it } from 'vitest';

import type { Clock, IdGenerator, SkillRepository } from './ports';
import { SkillService } from './skill-service';

class InMemorySkillRepository implements SkillRepository {
  public readonly skills = new Map<string, unknown>();
  public readonly stages = new Map<string, unknown>();
  public readonly progress = new Map<string, unknown>();

  public async createSkill(skill: unknown) {
    this.skills.set((skill as { id: string }).id, skill);
  }

  public async listSkills() {
    return [...this.skills.values()] as Awaited<
      ReturnType<SkillRepository['listSkills']>
    >;
  }

  public async findSkillById(id: string) {
    return (
      (this.skills.get(id) as Awaited<
        ReturnType<SkillRepository['findSkillById']>
      >) ?? null
    );
  }

  public async updateSkill(skill: unknown) {
    this.skills.set((skill as { id: string }).id, skill);
  }

  public async deleteSkill(id: string) {
    this.skills.delete(id);
  }

  public async createStage(stage: unknown) {
    this.stages.set((stage as { id: string }).id, stage);
  }

  public async listStagesBySkillId(skillId: string) {
    return ([...this.stages.values()] as Array<{ skillId: string }>).filter(
      (stage) => stage.skillId === skillId,
    ) as Awaited<ReturnType<SkillRepository['listStagesBySkillId']>>;
  }

  public async findStageById(id: string) {
    return (
      (this.stages.get(id) as Awaited<
        ReturnType<SkillRepository['findStageById']>
      >) ?? null
    );
  }

  public async updateStage(stage: unknown) {
    this.stages.set((stage as { id: string }).id, stage);
  }

  public async deleteStage(id: string) {
    this.stages.delete(id);
  }

  public async upsertStageProgress(progress: unknown) {
    this.progress.set(
      (progress as { skillStageId: string }).skillStageId,
      progress,
    );
  }

  public async findProgressByStageId(stageId: string) {
    return (
      (this.progress.get(stageId) as Awaited<
        ReturnType<SkillRepository['findProgressByStageId']>
      >) ?? null
    );
  }

  public async listProgressBySkillId(skillId: string) {
    const stageIds = (
      [...this.stages.values()] as Array<{ id: string; skillId: string }>
    )
      .filter((stage) => stage.skillId === skillId)
      .map((stage) => stage.id);

    return (
      [...this.progress.values()] as Array<{ skillStageId: string }>
    ).filter((item) => stageIds.includes(item.skillStageId)) as Awaited<
      ReturnType<SkillRepository['listProgressBySkillId']>
    >;
  }
}

class SequenceIdGenerator implements IdGenerator {
  private index = 0;

  public next() {
    this.index += 1;

    return `id-${this.index}`;
  }
}

class FixedClock implements Clock {
  public now() {
    return '2026-04-06T10:00:00.000Z';
  }
}

describe('SkillService', () => {
  it('creates a skill and stages', async () => {
    const repository = new InMemorySkillRepository();
    const service = new SkillService(
      repository,
      new SequenceIdGenerator(),
      new FixedClock(),
    );

    const skill = await service.createSkill({
      title: 'TypeScript',
      category: 'Engineering',
    });
    const stage = await service.createStage({
      skillId: skill.id,
      title: 'Can model domain entities',
      order: 1,
    });

    expect(skill.title).toBe('TypeScript');
    expect(stage.skillId).toBe(skill.id);
  });

  it('marks a skill stage as achieved', async () => {
    const repository = new InMemorySkillRepository();
    const service = new SkillService(
      repository,
      new SequenceIdGenerator(),
      new FixedClock(),
    );
    const skill = await service.createSkill({ title: 'React' });
    const stage = await service.createStage({
      skillId: skill.id,
      title: 'Builds context-driven state',
      order: 1,
    });

    const progress = await service.markStage({
      stageId: stage.id,
      note: 'Used in dashboard shell',
    });

    expect(progress.skillStageId).toBe(stage.id);
    expect(progress.note).toBe('Used in dashboard shell');
  });

  it('builds skill progress summary', async () => {
    const repository = new InMemorySkillRepository();
    const service = new SkillService(
      repository,
      new SequenceIdGenerator(),
      new FixedClock(),
    );
    const skill = await service.createSkill({ title: 'D3' });
    const stageA = await service.createStage({
      skillId: skill.id,
      title: 'Can render axes',
      order: 1,
    });
    await service.createStage({
      skillId: skill.id,
      title: 'Can render interaction',
      order: 2,
    });
    await service.markStage({ stageId: stageA.id });

    const summary = await service.getProgressSummary();

    expect(summary.totalSkills).toBe(1);
    expect(summary.totalStages).toBe(2);
    expect(summary.completedStages).toBe(1);
    expect(summary.completionRate).toBe(0.5);
  });

  it('updates and deletes a skill', async () => {
    const repository = new InMemorySkillRepository();
    const service = new SkillService(
      repository,
      new SequenceIdGenerator(),
      new FixedClock(),
    );
    const skill = await service.createSkill({ title: 'D3' });

    const updated = await service.updateSkill({
      skillId: skill.id,
      title: 'D3.js',
      category: 'Frontend',
    });

    expect(updated.title).toBe('D3.js');

    await service.deleteSkill({ skillId: skill.id });
    expect(await service.listSkills()).toHaveLength(0);
  });

  it('updates and deletes a stage', async () => {
    const repository = new InMemorySkillRepository();
    const service = new SkillService(
      repository,
      new SequenceIdGenerator(),
      new FixedClock(),
    );
    const skill = await service.createSkill({ title: 'React' });
    const stage = await service.createStage({
      skillId: skill.id,
      title: 'Context state',
      order: 1,
    });

    const updated = await service.updateStage({
      stageId: stage.id,
      title: 'Context state management',
      order: 2,
    });

    expect(updated.title).toBe('Context state management');
    expect(updated.order).toBe(2);

    await service.deleteStage({ stageId: stage.id });
    expect(await repository.findStageById(stage.id)).toBeNull();
  });
});
