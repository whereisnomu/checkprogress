import { useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { useTasks } from './tasks-context';

type TaskPanelProps = {
  variant?: 'compact' | 'full';
};

export const TaskPanel = ({ variant = 'compact' }: TaskPanelProps) => {
  const {
    tasks,
    isLoading,
    error,
    createTask,
    completeTask,
    updateTask,
    deleteTask,
  } = useTasks();
  const [title, setTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createTask({ title: title.trim() });
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>
          Create, complete, and refine tasks from one workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          className="grid gap-3 md:grid-cols-[1fr_auto]"
          onSubmit={handleSubmit}
        >
          <Input
            aria-label="Task title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task"
          />
          <Button type="submit" disabled={isSubmitting}>
            Add task
          </Button>
        </form>

        {error ? <p className="error-banner">{error}</p> : null}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        ) : null}

        {!isLoading && tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks yet. Add the first task to start tracking execution.
          </p>
        ) : null}

        <div className="grid gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/60 p-4"
            >
              <div className="flex-1">
                {editingTaskId === task.id ? (
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <Input
                      aria-label={`Edit ${task.title}`}
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        void updateTask({
                          taskId: task.id,
                          title: editingTitle.trim() || task.title,
                          status: task.status,
                        });
                        setEditingTaskId(null);
                        setEditingTitle('');
                      }}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.status === 'done' ? 'Completed' : 'Open'}
                    </p>
                  </>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  type="button"
                  disabled={task.status === 'done'}
                  onClick={() => void completeTask(task.id)}
                >
                  {task.status === 'done' ? 'Done' : 'Mark done'}
                </Button>
                {variant === 'full' ? (
                  <>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditingTitle(task.title);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => void deleteTask(task.id)}
                    >
                      Delete
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
