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

import { useRoutines } from './routines-context';

type RoutinePanelProps = {
  variant?: 'compact' | 'full';
};

export const RoutinePanel = ({ variant = 'compact' }: RoutinePanelProps) => {
  const {
    routines,
    isLoading,
    error,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    checkInRoutine,
  } = useRoutines();
  const [title, setTitle] = useState('');
  const [targetPerPeriod, setTargetPerPeriod] = useState('1');
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingTarget, setEditingTarget] = useState('1');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    await createRoutine({
      title: title.trim(),
      targetPerPeriod: Number(targetPerPeriod) || 1,
    });
    setTitle('');
    setTargetPerPeriod('1');
  };

  return (
    <Card className="bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Routines</CardTitle>
        <CardDescription>
          Track recurring daily execution and mark today's completion.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          className="grid gap-3 md:grid-cols-[1fr_120px_auto]"
          onSubmit={handleSubmit}
        >
          <Input
            aria-label="Routine title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a routine"
          />
          <Input
            aria-label="Routine target"
            value={targetPerPeriod}
            onChange={(event) => setTargetPerPeriod(event.target.value)}
            placeholder="Target"
          />
          <Button type="submit">Add routine</Button>
        </form>

        {error ? <p className="error-banner">{error}</p> : null}
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading routines...</p>
        ) : null}

        {!isLoading && routines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No routines yet. Add a daily routine to start building streaks.
          </p>
        ) : null}

        <div className="grid gap-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/60 p-4"
            >
              <div className="flex-1">
                {editingRoutineId === routine.id ? (
                  <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
                    <Input
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      aria-label={`Edit ${routine.title}`}
                    />
                    <Input
                      value={editingTarget}
                      onChange={(event) => setEditingTarget(event.target.value)}
                      aria-label={`Edit target ${routine.title}`}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        void updateRoutine({
                          routineId: routine.id,
                          title: editingTitle.trim() || routine.title,
                          targetPerPeriod:
                            Number(editingTarget) || routine.targetPerPeriod,
                        });
                        setEditingRoutineId(null);
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

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => void checkInRoutine(routine.id)}
                >
                  Check in
                </Button>
                {variant === 'full' ? (
                  <>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        setEditingRoutineId(routine.id);
                        setEditingTitle(routine.title);
                        setEditingTarget(String(routine.targetPerPeriod));
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => void deleteRoutine(routine.id)}
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
