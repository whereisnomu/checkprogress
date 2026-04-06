import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { useTasks } from '../features/tasks/tasks-context';
import { useTelegramMainButton } from '../features/telegram-webapp/telegram-sdk';

export const TelegramTasksPage = () => {
  const { tasks, createTask, completeTask, updateTask, deleteTask } =
    useTasks();
  const [title, setTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    void createTask({ title: title.trim() });
    setTitle('');
  };

  useTelegramMainButton({
    enabled: title.trim().length > 0,
    text: 'Create task',
    onClick: submit,
  });

  return (
    <main className="tg-page">
      <Card className="bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Input
              placeholder="Quick add task"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Button onClick={submit}>Add task</Button>
          </div>

          <div className="grid gap-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-border bg-background/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    {editingTaskId === task.id ? (
                      <div className="grid gap-2">
                        <Input
                          value={editingTitle}
                          onChange={(event) =>
                            setEditingTitle(event.target.value)
                          }
                        />
                        <Button
                          size="sm"
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
                          {task.status}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      disabled={task.status === 'done'}
                      onClick={() => void completeTask(task.id)}
                    >
                      Done
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditingTitle(task.title);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => void deleteTask(task.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};
