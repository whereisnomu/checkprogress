import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { apiClient } from '../../shared/api/client';

type Skill = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

type SkillStage = {
  id: string;
  skillId: string;
  title: string;
  description: string | null;
  order: number;
  createdAt: string;
};

type SkillsContextValue = {
  skills: Skill[];
  stagesBySkillId: Record<string, SkillStage[]>;
  isLoading: boolean;
  error: string | null;
  createSkill: (input: { title: string; category?: string }) => Promise<void>;
  updateSkill: (input: {
    skillId: string;
    title: string;
    category?: string;
  }) => Promise<void>;
  deleteSkill: (skillId: string) => Promise<void>;
  createStage: (input: {
    skillId: string;
    title: string;
    order: number;
  }) => Promise<void>;
  updateStage: (input: {
    stageId: string;
    skillId: string;
    title: string;
    order: number;
  }) => Promise<void>;
  deleteStage: (input: { skillId: string; stageId: string }) => Promise<void>;
  markStage: (stageId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const SkillsContext = createContext<SkillsContextValue | null>(null);

export const SkillsProvider = ({ children }: PropsWithChildren) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [stagesBySkillId, setStagesBySkillId] = useState<
    Record<string, SkillStage[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);

    try {
      const nextSkills = await apiClient.listSkills();
      setSkills(Array.isArray(nextSkills) ? nextSkills : []);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unknown skills error',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createSkill = useCallback(
    async (input: { title: string; category?: string }) => {
      const payload = {
        title: input.title,
        ...(input.category !== undefined ? { category: input.category } : {}),
      };
      const created = await apiClient.createSkill(payload);
      setSkills((current) => [created, ...current]);
    },
    [],
  );

  const updateSkill = useCallback(
    async (input: { skillId: string; title: string; category?: string }) => {
      const payload = {
        title: input.title,
        ...(input.category !== undefined ? { category: input.category } : {}),
      };
      const updated = await apiClient.updateSkill(input.skillId, payload);
      setSkills((current) =>
        current.map((skill) => (skill.id === input.skillId ? updated : skill)),
      );
    },
    [],
  );

  const deleteSkill = useCallback(async (skillId: string) => {
    await apiClient.deleteSkill(skillId);
    setSkills((current) => current.filter((skill) => skill.id !== skillId));
    setStagesBySkillId((current) => {
      const next = { ...current };
      delete next[skillId];
      return next;
    });
  }, []);

  const createStage = useCallback(
    async (input: { skillId: string; title: string; order: number }) => {
      const created = await apiClient.createSkillStage(input.skillId, {
        title: input.title,
        order: input.order,
      });

      setStagesBySkillId((current) => ({
        ...current,
        [input.skillId]: [...(current[input.skillId] ?? []), created].sort(
          (a, b) => a.order - b.order,
        ),
      }));
    },
    [],
  );

  const updateStage = useCallback(
    async (input: {
      stageId: string;
      skillId: string;
      title: string;
      order: number;
    }) => {
      const updated = await apiClient.updateSkillStage(input.stageId, {
        title: input.title,
        order: input.order,
      });
      setStagesBySkillId((current) => ({
        ...current,
        [input.skillId]: (current[input.skillId] ?? [])
          .map((stage) => (stage.id === input.stageId ? updated : stage))
          .sort((a, b) => a.order - b.order),
      }));
    },
    [],
  );

  const deleteStage = useCallback(
    async (input: { skillId: string; stageId: string }) => {
      await apiClient.deleteSkillStage(input.stageId);
      setStagesBySkillId((current) => ({
        ...current,
        [input.skillId]: (current[input.skillId] ?? []).filter(
          (stage) => stage.id !== input.stageId,
        ),
      }));
    },
    [],
  );

  const markStage = useCallback(async (stageId: string) => {
    await apiClient.markSkillStage(stageId, {});
  }, []);

  const value = useMemo(
    () => ({
      skills,
      stagesBySkillId,
      isLoading,
      error,
      createSkill,
      updateSkill,
      deleteSkill,
      createStage,
      updateStage,
      deleteStage,
      markStage,
      refresh,
    }),
    [
      createSkill,
      createStage,
      deleteSkill,
      deleteStage,
      error,
      isLoading,
      markStage,
      refresh,
      skills,
      stagesBySkillId,
      updateSkill,
      updateStage,
    ],
  );

  return (
    <SkillsContext.Provider value={value}>{children}</SkillsContext.Provider>
  );
};

export const useSkills = () => {
  const context = useContext(SkillsContext);

  if (!context) {
    throw new Error('useSkills must be used within SkillsProvider');
  }

  return context;
};
