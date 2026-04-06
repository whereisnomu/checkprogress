import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './app';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL | Request) => {
        const url =
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;

        if (url.endsWith('/api/dashboard/summary')) {
          return {
            ok: true,
            json: async () => ({
              data: {
                tasks: {
                  totalTasks: 4,
                  completedTasks: 2,
                  activeTasks: 2,
                  completionRate: 0.5,
                },
                routines: {
                  totalRoutines: 3,
                  completedRoutines: 1,
                  skippedRoutines: 1,
                  pendingRoutines: 1,
                },
                skills: {
                  totalSkills: 2,
                  totalStages: 4,
                  completedStages: 2,
                  completionRate: 0.5,
                },
              },
            }),
          } as Response;
        }

        if (url.endsWith('/api/dashboard/charts')) {
          return {
            ok: true,
            json: async () => ({
              data: {
                taskDistribution: [
                  { label: 'Completed tasks', value: 2 },
                  { label: 'Active tasks', value: 2 },
                ],
                routineDistribution: [
                  { label: 'Done routines', value: 1 },
                  { label: 'Skipped routines', value: 1 },
                  { label: 'Pending routines', value: 1 },
                ],
                skillDistribution: [
                  { label: 'Completed stages', value: 2 },
                  { label: 'Open stages', value: 2 },
                ],
                taskCompletionSeries: [
                  { label: '2026-04-01', value: 0 },
                  { label: '2026-04-02', value: 1 },
                  { label: '2026-04-03', value: 0 },
                  { label: '2026-04-04', value: 1 },
                  { label: '2026-04-05', value: 0 },
                  { label: '2026-04-06', value: 2 },
                  { label: '2026-04-07', value: 0 },
                ],
                routineHeatmap: Array.from({ length: 30 }, (_, index) => ({
                  label: `2026-03-${String(index + 1).padStart(2, '0')}`,
                  value: index % 3 === 0 ? 1 : 0,
                })),
                routineStreakSeries: [
                  { label: '2026-04-01', value: 0 },
                  { label: '2026-04-02', value: 1 },
                  { label: '2026-04-03', value: 2 },
                  { label: '2026-04-04', value: 3 },
                  { label: '2026-04-05', value: 0 },
                  { label: '2026-04-06', value: 1 },
                  { label: '2026-04-07', value: 2 },
                ],
              },
            }),
          } as Response;
        }

        if (url.endsWith('/api/tasks')) {
          return {
            ok: true,
            json: async () => ({
              data: [
                {
                  id: 'task-1',
                  title: 'Build charts',
                  description: null,
                  status: 'todo',
                  createdAt: '2026-04-06T10:00:00.000Z',
                  updatedAt: '2026-04-06T10:00:00.000Z',
                  completedAt: null,
                },
              ],
            }),
          } as Response;
        }

        if (url.endsWith('/api/routines')) {
          return {
            ok: true,
            json: async () => ({
              data: [
                {
                  id: 'routine-1',
                  title: 'Morning review',
                  description: null,
                  frequency: 'daily',
                  targetPerPeriod: 1,
                  createdAt: '2026-04-06T10:00:00.000Z',
                  updatedAt: '2026-04-06T10:00:00.000Z',
                },
              ],
            }),
          } as Response;
        }

        if (url.endsWith('/api/skills')) {
          return {
            ok: true,
            json: async () => ({
              data: [
                {
                  id: 'skill-1',
                  title: 'TypeScript',
                  description: null,
                  category: 'Engineering',
                  createdAt: '2026-04-06T10:00:00.000Z',
                  updatedAt: '2026-04-06T10:00:00.000Z',
                },
              ],
            }),
          } as Response;
        }

        if (url.endsWith('/api/settings/system')) {
          return {
            ok: true,
            json: async () => ({
              data: {
                webDashboardUrl: 'http://localhost:3000',
                timezone: 'Europe/Moscow',
                telegramEnabled: true,
                ownerChatConfigured: true,
                remindersEnabled: true,
                dailyReminderTime: '20:00',
              },
            }),
          } as Response;
        }

        if (url.endsWith('/api/settings/telegram-link')) {
          return {
            ok: true,
            json: async () => ({
              data: {
                linkedChat: null,
                latestLinkToken: {
                  code: 'AB12CD34',
                  createdAt: '2026-04-06T10:00:00.000Z',
                  expiresAt: '2026-04-06T10:30:00.000Z',
                  consumedAt: null,
                },
              },
            }),
          } as Response;
        }

        return {
          ok: false,
          json: async () => ({ error: { message: 'Unexpected request' } }),
        } as Response;
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders dashboard heading', async () => {
    render(<App />);

    expect(
      screen.getByText(
        'Daily execution with a shared web and Telegram workflow',
      ),
    ).toBeInTheDocument();
    expect(await screen.findByText('Total tasks')).toBeInTheDocument();
    expect(await screen.findByText('Routines today')).toBeInTheDocument();
    expect(await screen.findByText('Skills tracked')).toBeInTheDocument();
    expect(await screen.findByText('Skill completion')).toBeInTheDocument();
    expect(await screen.findByText('Task Distribution')).toBeInTheDocument();
    expect(
      await screen.findByText('Task Completion Trend'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Routine Activity Heatmap'),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Tasks' }),
    ).toBeInTheDocument();
  });

  it('renders task workspace and allows editing UI flow', async () => {
    render(<App />);

    const [tasksNavLink] = await screen.findAllByRole('link', {
      name: 'Tasks',
    });
    expect(tasksNavLink).toBeDefined();
    fireEvent.click(tasksNavLink as HTMLElement);

    expect(
      await screen.findByText('Manage the full task lifecycle'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Build charts')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    expect(
      await screen.findByRole('button', { name: 'Save' }),
    ).toBeInTheDocument();
  });

  it('renders a request error message', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: false }),
    );

    render(<App />);

    expect(
      (await screen.findAllByText('Request failed')).length,
    ).toBeGreaterThan(0);
  });

  it('renders routines workspace', async () => {
    render(<App />);

    const [routinesNavLink] = await screen.findAllByRole('link', {
      name: 'Routines',
    });
    expect(routinesNavLink).toBeDefined();
    fireEvent.click(routinesNavLink as HTMLElement);

    expect(
      await screen.findByText('Manage daily routines and check-ins'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Morning review')).toBeInTheDocument();
  });

  it('renders skills workspace', async () => {
    render(<App />);

    const [skillsNavLink] = await screen.findAllByRole('link', {
      name: 'Skills',
    });
    expect(skillsNavLink).toBeDefined();
    fireEvent.click(skillsNavLink as HTMLElement);

    expect(
      await screen.findByText('Track skills and progressive stages'),
    ).toBeInTheDocument();
    expect(await screen.findByText('TypeScript')).toBeInTheDocument();
  });

  it('renders settings workspace', async () => {
    render(<App />);

    const [settingsNavLink] = await screen.findAllByRole('link', {
      name: 'Settings',
    });
    expect(settingsNavLink).toBeDefined();
    fireEvent.click(settingsNavLink as HTMLElement);

    expect(
      await screen.findByText('System and integration status'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Europe/Moscow')).toBeInTheDocument();
    expect((await screen.findAllByText('Yes')).length).toBe(3);
    expect(await screen.findByText('20:00')).toBeInTheDocument();
    expect(await screen.findByText('AB12CD34')).toBeInTheDocument();
  });
});
