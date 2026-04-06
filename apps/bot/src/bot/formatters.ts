import type {
  DashboardCharts,
  Routine,
  Skill,
  SkillStage,
  SkillProgressSummary,
  Task,
} from '@progress-state/shared';

type TodayOverviewInput = {
  tasks: Task[];
  routines: Routine[];
  skillSummary: SkillProgressSummary;
  today: string;
};

export const formatTodayOverview = ({
  tasks,
  routines,
  skillSummary,
  today,
}: TodayOverviewInput) => {
  const activeTasks = tasks.filter((task) => task.status !== 'done');
  const completedTasks = tasks.filter((task) => task.status === 'done');
  const taskLines = activeTasks.length
    ? activeTasks
        .slice(0, 5)
        .map((task, index) => `${index + 1}. ${task.title}`)
        .join('\n')
    : 'No active tasks';

  return [
    `Today: ${today}`,
    '',
    `Tasks: ${completedTasks.length}/${tasks.length} completed`,
    taskLines,
    '',
    `Routines: ${routines.length} configured`,
    `Skills: ${skillSummary.completedStages}/${skillSummary.totalStages} stages completed`,
  ].join('\n');
};

export const formatRoutineList = (routines: Routine[]) => {
  if (routines.length === 0) {
    return 'No routines configured yet.';
  }

  return [
    'Choose a routine to mark as done today:',
    ...routines.map((routine) => `- ${routine.title}`),
  ].join('\n');
};

export const formatTaskList = (tasks: Task[]) => {
  if (tasks.length === 0) {
    return 'No tasks yet.';
  }

  return [
    'Tasks:',
    ...tasks.map(
      (task, index) =>
        `${index + 1}. [${task.status === 'done' ? 'x' : ' '}] ${task.title}`,
    ),
  ].join('\n');
};

export const formatSkillList = (skills: Skill[]) => {
  if (skills.length === 0) {
    return 'No skills configured yet.';
  }

  return [
    'Skills:',
    ...skills.map(
      (skill, index) =>
        `${index + 1}. ${skill.title}${skill.category ? ` (${skill.category})` : ''}`,
    ),
  ].join('\n');
};

export const formatStageList = (skillTitle: string, stages: SkillStage[]) => {
  if (stages.length === 0) {
    return `No stages configured for ${skillTitle}.`;
  }

  return [
    `Stages for ${skillTitle}:`,
    ...stages.map((stage) => `${stage.order}. ${stage.title}`),
  ].join('\n');
};

export const formatBotHelp = () =>
  [
    'Available commands:',
    '/link <code> - link this Telegram chat to the panel',
    '/status - show current link status',
    '/today - current overview',
    '/add <title> - create a task',
    '/new_routine - create a routine with a guided flow',
    '/new_skill - create a skill with a guided flow',
    '/new_stage <skill-id> - create a stage with a guided flow',
    '/tasks - list tasks with quick actions',
    '/task_done <task-id> - mark a task as done',
    '/routines - list routines with quick check-ins',
    '/skills - list skills and open stages',
    '/stage_done <stage-id> - mark a stage complete',
    '/help - show this command list',
  ].join('\n');

export const formatReminderMessage = (params: {
  openTasks: number;
  routinesConfigured: number;
  completedStages: number;
  totalStages: number;
}) =>
  [
    'Daily reminder',
    '',
    `Open tasks: ${params.openTasks}`,
    `Routines configured: ${params.routinesConfigured}`,
    `Skill progress: ${params.completedStages}/${params.totalStages}`,
    '',
    'Use /today for the full overview.',
  ].join('\n');

const renderBars = (
  data: Array<{ label: string; value: number }>,
  width = 8,
) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return data
    .map((item) => {
      const size = Math.round((item.value / maxValue) * width);
      return `${item.label}: ${'█'.repeat(size)} ${item.value}`;
    })
    .join('\n');
};

export const formatAnalyticsSummary = (charts: DashboardCharts) =>
  [
    'Analytics snapshot',
    '',
    'Task distribution',
    renderBars(charts.taskDistribution),
    '',
    'Task completion trend',
    renderBars(charts.taskCompletionSeries.slice(-7)),
    '',
    'Routine streak trend',
    renderBars(charts.routineStreakSeries.slice(-7)),
  ].join('\n');
