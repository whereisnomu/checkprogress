import {
  RoutineService,
  SkillService,
  TaskService,
} from '@progress-state/shared';
import {
  openDatabase,
  runMigrations,
  SqliteRoutineRepository,
  SqliteSkillRepository,
  SqliteTaskRepository,
  SystemClock,
  UuidGenerator,
} from '@progress-state/shared-sqlite';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from './create-app';

const createTestApp = () => {
  const database = openDatabase({
    sqlitePath: ':memory:',
    sqliteBusyTimeoutMs: 5000,
  });

  runMigrations(database, '2026-04-06T10:00:00.000Z');

  const idGenerator = new UuidGenerator();
  const clock = new SystemClock();

  return createApp({
    taskService: new TaskService(
      new SqliteTaskRepository(database),
      idGenerator,
      clock,
    ),
    routineService: new RoutineService(
      new SqliteRoutineRepository(database),
      idGenerator,
      clock,
    ),
    skillService: new SkillService(
      new SqliteSkillRepository(database),
      idGenerator,
      clock,
    ),
    systemInfo: {
      webDashboardUrl: 'http://localhost:3000',
      timezone: 'Europe/Moscow',
      telegramEnabled: true,
      ownerChatId: '123',
      remindersEnabled: true,
      dailyReminderTime: '20:00',
    },
  });
};

describe('createApp', () => {
  it('creates and lists tasks', async () => {
    const app = createTestApp();

    const createResponse = await request(app)
      .post('/api/tasks')
      .send({ title: 'Create first task' })
      .expect(201);

    expect(createResponse.body.data.title).toBe('Create first task');

    const listResponse = await request(app).get('/api/tasks').expect(200);

    expect(listResponse.body.data).toHaveLength(1);
  });

  it('returns system settings info', async () => {
    const app = createTestApp();

    const response = await request(app).get('/api/settings/system').expect(200);

    expect(response.body.data.webDashboardUrl).toBe('http://localhost:3000');
    expect(response.body.data.telegramEnabled).toBe(true);
    expect(response.body.data.ownerChatConfigured).toBe(true);
    expect(response.body.data.remindersEnabled).toBe(true);
    expect(response.body.data.dailyReminderTime).toBe('20:00');
  });

  it('returns dashboard summary', async () => {
    const app = createTestApp();
    const taskResponse = await request(app)
      .post('/api/tasks')
      .send({ title: 'Measure progress' })
      .expect(201);

    await request(app)
      .post(`/api/tasks/${taskResponse.body.data.id}/complete`)
      .send({})
      .expect(200);

    const summaryResponse = await request(app)
      .get('/api/dashboard/summary')
      .expect(200);

    expect(summaryResponse.body.data.tasks.totalTasks).toBe(1);
    expect(summaryResponse.body.data.tasks.completedTasks).toBe(1);
    expect(summaryResponse.body.data.routines.totalRoutines).toBe(0);
    expect(summaryResponse.body.data.skills.totalSkills).toBe(0);
  });

  it('returns 404 for a missing task completion request', async () => {
    const app = createTestApp();

    const response = await request(app)
      .post('/api/tasks/missing-task/complete')
      .send({})
      .expect(404);

    expect(response.body.error.message).toContain('missing-task');
  });

  it('updates and deletes a task', async () => {
    const app = createTestApp();

    const createResponse = await request(app)
      .post('/api/tasks')
      .send({ title: 'Draft task' })
      .expect(201);

    const taskId = createResponse.body.data.id as string;

    const updateResponse = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({
        title: 'Updated task',
        status: 'in_progress',
      })
      .expect(200);

    expect(updateResponse.body.data.title).toBe('Updated task');
    expect(updateResponse.body.data.status).toBe('in_progress');

    await request(app).delete(`/api/tasks/${taskId}`).expect(204);

    const listResponse = await request(app).get('/api/tasks').expect(200);
    expect(listResponse.body.data).toHaveLength(0);
  });

  it('creates routines and records a daily check-in', async () => {
    const app = createTestApp();

    const createResponse = await request(app)
      .post('/api/routines')
      .send({
        title: 'Read 20 minutes',
        frequency: 'daily',
        targetPerPeriod: 1,
      })
      .expect(201);

    const routineId = createResponse.body.data.id as string;

    const checkInResponse = await request(app)
      .post(`/api/routines/${routineId}/check-in`)
      .send({
        date: '2026-04-06',
        status: 'done',
      })
      .expect(200);

    expect(checkInResponse.body.data.routineId).toBe(routineId);
    expect(checkInResponse.body.data.status).toBe('done');

    const listResponse = await request(app).get('/api/routines').expect(200);

    expect(listResponse.body.data).toHaveLength(1);
  });

  it('updates and deletes a routine', async () => {
    const app = createTestApp();

    const createResponse = await request(app)
      .post('/api/routines')
      .send({
        title: 'Walk',
        frequency: 'daily',
        targetPerPeriod: 1,
      })
      .expect(201);

    const routineId = createResponse.body.data.id as string;

    const updateResponse = await request(app)
      .patch(`/api/routines/${routineId}`)
      .send({
        title: 'Long walk',
        frequency: 'daily',
        targetPerPeriod: 2,
      })
      .expect(200);

    expect(updateResponse.body.data.title).toBe('Long walk');
    expect(updateResponse.body.data.targetPerPeriod).toBe(2);

    await request(app).delete(`/api/routines/${routineId}`).expect(204);

    const listResponse = await request(app).get('/api/routines').expect(200);
    expect(listResponse.body.data).toHaveLength(0);
  });

  it('creates skills, stages, and marks a stage as complete', async () => {
    const app = createTestApp();

    const skillResponse = await request(app)
      .post('/api/skills')
      .send({ title: 'D3.js', category: 'Frontend' })
      .expect(201);

    const stageResponse = await request(app)
      .post(`/api/skills/${skillResponse.body.data.id}/stages`)
      .send({
        title: 'Builds progress bars',
        order: 1,
      })
      .expect(201);

    const markResponse = await request(app)
      .post(`/api/skill-stages/${stageResponse.body.data.id}/mark`)
      .send({ note: 'Used in analytics dashboard' })
      .expect(200);

    expect(markResponse.body.data.skillStageId).toBe(
      stageResponse.body.data.id,
    );

    const summaryResponse = await request(app)
      .get('/api/dashboard/summary')
      .expect(200);

    expect(summaryResponse.body.data.skills.totalSkills).toBe(1);
    expect(summaryResponse.body.data.skills.completedStages).toBe(1);
  });

  it('updates and deletes skills and stages', async () => {
    const app = createTestApp();

    const skillResponse = await request(app)
      .post('/api/skills')
      .send({ title: 'TypeScript' })
      .expect(201);

    const skillId = skillResponse.body.data.id as string;

    const updateSkillResponse = await request(app)
      .patch(`/api/skills/${skillId}`)
      .send({
        title: 'TypeScript Advanced',
        category: 'Engineering',
      })
      .expect(200);

    expect(updateSkillResponse.body.data.title).toBe('TypeScript Advanced');

    const stageResponse = await request(app)
      .post(`/api/skills/${skillId}/stages`)
      .send({ title: 'Models domain entities', order: 1 })
      .expect(201);

    const stageId = stageResponse.body.data.id as string;

    const updateStageResponse = await request(app)
      .patch(`/api/skill-stages/${stageId}`)
      .send({ title: 'Models rich domain entities', order: 2 })
      .expect(200);

    expect(updateStageResponse.body.data.order).toBe(2);

    await request(app).delete(`/api/skill-stages/${stageId}`).expect(204);
    await request(app).delete(`/api/skills/${skillId}`).expect(204);

    const listResponse = await request(app).get('/api/skills').expect(200);
    expect(listResponse.body.data).toHaveLength(0);
  });

  it('returns dashboard chart datasets', async () => {
    const app = createTestApp();

    await request(app)
      .post('/api/tasks')
      .send({ title: 'Ship charts' })
      .expect(201);

    const response = await request(app)
      .get('/api/dashboard/charts')
      .expect(200);

    expect(response.body.data.taskDistribution).toEqual([
      { label: 'Completed tasks', value: 0 },
      { label: 'Active tasks', value: 1 },
    ]);
    expect(response.body.data.taskCompletionSeries).toHaveLength(7);
    expect(response.body.data.routineHeatmap).toHaveLength(30);
    expect(response.body.data.routineStreakSeries).toHaveLength(7);
  });
});
