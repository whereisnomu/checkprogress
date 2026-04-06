import type { Task } from '../domain/task';
import type { Routine, RoutineEntry } from '../domain/routine';
import type { Skill, SkillStage, SkillStageProgress } from '../domain/skill';

export interface TaskRepository {
  create(task: Task): Promise<void>;
  list(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface RoutineRepository {
  create(routine: Routine): Promise<void>;
  list(): Promise<Routine[]>;
  findById(id: string): Promise<Routine | null>;
  update(routine: Routine): Promise<void>;
  delete(id: string): Promise<void>;
  upsertEntry(entry: RoutineEntry): Promise<void>;
  findEntryByRoutineAndDate(
    routineId: string,
    date: string,
  ): Promise<RoutineEntry | null>;
  listEntriesByDate(date: string): Promise<RoutineEntry[]>;
  listEntriesInRange(
    startDate: string,
    endDate: string,
  ): Promise<RoutineEntry[]>;
}

export interface SkillRepository {
  createSkill(skill: Skill): Promise<void>;
  listSkills(): Promise<Skill[]>;
  findSkillById(id: string): Promise<Skill | null>;
  updateSkill(skill: Skill): Promise<void>;
  deleteSkill(id: string): Promise<void>;
  createStage(stage: SkillStage): Promise<void>;
  listStagesBySkillId(skillId: string): Promise<SkillStage[]>;
  findStageById(id: string): Promise<SkillStage | null>;
  updateStage(stage: SkillStage): Promise<void>;
  deleteStage(id: string): Promise<void>;
  upsertStageProgress(progress: SkillStageProgress): Promise<void>;
  findProgressByStageId(stageId: string): Promise<SkillStageProgress | null>;
  listProgressBySkillId(skillId: string): Promise<SkillStageProgress[]>;
}

export interface IdGenerator {
  next(): string;
}

export interface Clock {
  now(): string;
}

export interface TelegramLinkRepository {
  createLinkToken(token: {
    code: string;
    createdAt: string;
    expiresAt: string;
    consumedAt: string | null;
  }): Promise<void>;
  getActiveLinkToken(
    code: string,
    now: string,
  ): Promise<{
    code: string;
    createdAt: string;
    expiresAt: string;
    consumedAt: string | null;
  } | null>;
  consumeLinkToken(code: string, consumedAt: string): Promise<void>;
  upsertLinkedChat(link: {
    chatId: string;
    userId: string | null;
    linkedAt: string;
  }): Promise<void>;
  getLinkedChat(): Promise<{
    chatId: string;
    userId: string | null;
    linkedAt: string;
  } | null>;
  getLatestLinkToken(): Promise<{
    code: string;
    createdAt: string;
    expiresAt: string;
    consumedAt: string | null;
  } | null>;
}
