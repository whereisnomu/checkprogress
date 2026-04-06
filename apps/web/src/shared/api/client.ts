import type {
  DashboardCharts,
  DashboardSummary,
  Routine,
  RoutineEntry,
  Task,
} from '../../app/types';

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

type SkillStageProgress = {
  id: string;
  skillStageId: string;
  achievedAt: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

type SystemSettings = {
  webDashboardUrl: string;
  timezone: string;
  telegramEnabled: boolean;
  ownerChatConfigured: boolean;
  remindersEnabled: boolean;
  dailyReminderTime: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error('Request failed');
  }

  const payload = (await response.json()) as { data: T };
  return payload.data;
};

export const apiClient = {
  async getDashboardSummary() {
    const response = await fetch(`${apiBaseUrl}/api/dashboard/summary`);
    return parseResponse<DashboardSummary>(response);
  },

  async getDashboardCharts() {
    const response = await fetch(`${apiBaseUrl}/api/dashboard/charts`);
    return parseResponse<DashboardCharts>(response);
  },

  async listTasks() {
    const response = await fetch(`${apiBaseUrl}/api/tasks`);
    return parseResponse<Task[]>(response);
  },

  async createTask(input: { title: string; description?: string }) {
    const response = await fetch(`${apiBaseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return parseResponse<Task>(response);
  },

  async completeTask(taskId: string) {
    const response = await fetch(`${apiBaseUrl}/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    return parseResponse<Task>(response);
  },

  async updateTask(
    taskId: string,
    input: { title: string; description?: string; status: Task['status'] },
  ) {
    const response = await fetch(`${apiBaseUrl}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return parseResponse<Task>(response);
  },

  async deleteTask(taskId: string) {
    const response = await fetch(`${apiBaseUrl}/api/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }
  },

  async listRoutines() {
    const response = await fetch(`${apiBaseUrl}/api/routines`);
    return parseResponse<Routine[]>(response);
  },

  async createRoutine(input: {
    title: string;
    description?: string;
    frequency: 'daily';
    targetPerPeriod: number;
  }) {
    const response = await fetch(`${apiBaseUrl}/api/routines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return parseResponse<Routine>(response);
  },

  async updateRoutine(
    routineId: string,
    input: {
      title: string;
      description?: string;
      frequency: 'daily';
      targetPerPeriod: number;
    },
  ) {
    const response = await fetch(`${apiBaseUrl}/api/routines/${routineId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return parseResponse<Routine>(response);
  },

  async deleteRoutine(routineId: string) {
    const response = await fetch(`${apiBaseUrl}/api/routines/${routineId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }
  },

  async checkInRoutine(
    routineId: string,
    input: { date: string; status: RoutineEntry['status']; note?: string },
  ) {
    const response = await fetch(
      `${apiBaseUrl}/api/routines/${routineId}/check-in`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      },
    );

    return parseResponse<RoutineEntry>(response);
  },

  async listSkills() {
    const response = await fetch(`${apiBaseUrl}/api/skills`);
    return parseResponse<Skill[]>(response);
  },

  async createSkill(input: { title: string; category?: string }) {
    const response = await fetch(`${apiBaseUrl}/api/skills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return parseResponse<Skill>(response);
  },

  async updateSkill(
    skillId: string,
    input: { title: string; category?: string },
  ) {
    const response = await fetch(`${apiBaseUrl}/api/skills/${skillId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return parseResponse<Skill>(response);
  },

  async deleteSkill(skillId: string) {
    const response = await fetch(`${apiBaseUrl}/api/skills/${skillId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }
  },

  async createSkillStage(
    skillId: string,
    input: { title: string; order: number },
  ) {
    const response = await fetch(`${apiBaseUrl}/api/skills/${skillId}/stages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return parseResponse<SkillStage>(response);
  },

  async updateSkillStage(
    stageId: string,
    input: { title: string; order: number },
  ) {
    const response = await fetch(`${apiBaseUrl}/api/skill-stages/${stageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    return parseResponse<SkillStage>(response);
  },

  async deleteSkillStage(stageId: string) {
    const response = await fetch(`${apiBaseUrl}/api/skill-stages/${stageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }
  },

  async markSkillStage(stageId: string, input: { note?: string }) {
    const response = await fetch(
      `${apiBaseUrl}/api/skill-stages/${stageId}/mark`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      },
    );

    return parseResponse<SkillStageProgress>(response);
  },

  async getSystemSettings() {
    const response = await fetch(`${apiBaseUrl}/api/settings/system`);
    return parseResponse<SystemSettings>(response);
  },
};
