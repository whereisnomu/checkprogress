export type Skill = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SkillStage = {
  id: string;
  skillId: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: string;
};

export type SkillStageProgress = {
  id: string;
  skillStageId: string;
  achievedAt: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export const createSkill = (params: {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  now: string;
}): Skill => ({
  id: params.id,
  title: params.title.trim(),
  description: params.description?.trim() || null,
  category: params.category?.trim() || null,
  createdAt: params.now,
  updatedAt: params.now,
});

export const createSkillStage = (params: {
  id: string;
  skillId: string;
  title: string;
  description?: string | null;
  order: number;
  now: string;
}): SkillStage => ({
  id: params.id,
  skillId: params.skillId,
  title: params.title.trim(),
  description: params.description?.trim() || null,
  order: params.order,
  createdAt: params.now,
});

export const createSkillStageProgress = (params: {
  id: string;
  skillStageId: string;
  achievedAt: string;
  note?: string | null;
  now: string;
}): SkillStageProgress => ({
  id: params.id,
  skillStageId: params.skillStageId,
  achievedAt: params.achievedAt,
  note: params.note?.trim() || null,
  createdAt: params.now,
  updatedAt: params.now,
});

export const updateSkillStageProgress = (
  progress: SkillStageProgress,
  params: {
    achievedAt: string;
    note?: string | null;
    now: string;
  },
): SkillStageProgress => ({
  ...progress,
  achievedAt: params.achievedAt,
  note: params.note?.trim() || null,
  updatedAt: params.now,
});

export const updateSkill = (
  skill: Skill,
  params: {
    title: string;
    description?: string | null;
    category?: string | null;
    now: string;
  },
): Skill => ({
  ...skill,
  title: params.title.trim(),
  description: params.description?.trim() || null,
  category: params.category?.trim() || null,
  updatedAt: params.now,
});

export const updateSkillStage = (
  stage: SkillStage,
  params: {
    title: string;
    description?: string | null;
    order: number;
  },
): SkillStage => ({
  ...stage,
  title: params.title.trim(),
  description: params.description?.trim() || null,
  order: params.order,
});
