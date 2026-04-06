import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { useRoutines } from '../features/routines/routines-context';
import { useTelegramMainButton } from '../features/telegram-webapp/telegram-sdk';

export const TelegramRoutinesPage = () => {
  const {
    routines,
    createRoutine,
    checkInRoutine,
    updateRoutine,
    deleteRoutine,
  } = useRoutines();
  const [title, setTitle] = useState('');
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    void createRoutine({ title: title.trim(), targetPerPeriod: 1 });
    setTitle('');
  };

  useTelegramMainButton({
    enabled: title.trim().length > 0,
    text: 'Create routine',
    onClick: submit,
  });

  return (
    <main className="tg-page">
      <Card className="bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Routines</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Input
              placeholder="New routine"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Button onClick={submit}>Add routine</Button>
          </div>

          <div className="grid gap-2">
            {routines.map((routine) => (
              <div
                key={routine.id}
                className="rounded-lg border border-border bg-background/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    {editingRoutineId === routine.id ? (
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
                            void updateRoutine({
                              routineId: routine.id,
                              title: editingTitle.trim() || routine.title,
                              targetPerPeriod: routine.targetPerPeriod,
                            });
                            setEditingRoutineId(null);
                            setEditingTitle('');
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{routine.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {routine.targetPerPeriod} per day
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => void checkInRoutine(routine.id)}
                    >
                      Check in
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingRoutineId(routine.id);
                        setEditingTitle(routine.title);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => void deleteRoutine(routine.id)}
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
