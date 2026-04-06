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

import { useSkills } from './skills-context';

export const SkillPanel = () => {
  const {
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
  } = useSkills();
  const [skillTitle, setSkillTitle] = useState('');
  const [skillCategory, setSkillCategory] = useState('');
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSkillTitle, setEditingSkillTitle] = useState('');
  const [editingSkillCategory, setEditingSkillCategory] = useState('');
  const [stageInputs, setStageInputs] = useState<
    Record<string, { title: string; order: string }>
  >({});
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [editingStageTitle, setEditingStageTitle] = useState('');
  const [editingStageOrder, setEditingStageOrder] = useState('1');

  const handleSkillSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!skillTitle.trim()) return;

    await createSkill({
      title: skillTitle.trim(),
      ...(skillCategory.trim() ? { category: skillCategory.trim() } : {}),
    });

    setSkillTitle('');
    setSkillCategory('');
  };

  return (
    <div className="grid gap-6">
      <Card className="bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Skills</CardTitle>
          <CardDescription>
            Track capabilities and break them down into progressive stages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-[1fr_220px_auto]"
            onSubmit={handleSkillSubmit}
          >
            <Input
              aria-label="Skill title"
              placeholder="Add a skill"
              value={skillTitle}
              onChange={(event) => setSkillTitle(event.target.value)}
            />
            <Input
              aria-label="Skill category"
              placeholder="Category"
              value={skillCategory}
              onChange={(event) => setSkillCategory(event.target.value)}
            />
            <Button type="submit">Add skill</Button>
          </form>
        </CardContent>
      </Card>

      {error ? <p className="error-banner">{error}</p> : null}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading skills...</p>
      ) : null}

      {!isLoading && skills.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No skills yet. Add a skill and break it down into stages.
        </p>
      ) : null}

      <div className="grid gap-4">
        {skills.map((skill) => (
          <Card key={skill.id} className="bg-card/80 backdrop-blur">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  {editingSkillId === skill.id ? (
                    <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
                      <Input
                        value={editingSkillTitle}
                        onChange={(event) =>
                          setEditingSkillTitle(event.target.value)
                        }
                        aria-label={`Edit skill ${skill.title}`}
                      />
                      <Input
                        value={editingSkillCategory}
                        onChange={(event) =>
                          setEditingSkillCategory(event.target.value)
                        }
                        aria-label={`Edit category ${skill.title}`}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          const payload = {
                            skillId: skill.id,
                            title: editingSkillTitle.trim() || skill.title,
                            ...(editingSkillCategory.trim()
                              ? { category: editingSkillCategory.trim() }
                              : {}),
                          };
                          void updateSkill(payload);
                          setEditingSkillId(null);
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CardTitle>{skill.title}</CardTitle>
                      <CardDescription>
                        {skill.category ?? 'Uncategorized'}
                      </CardDescription>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingSkillId(skill.id);
                      setEditingSkillTitle(skill.title);
                      setEditingSkillCategory(skill.category ?? '');
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => void deleteSkill(skill.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <form
                className="grid gap-3 md:grid-cols-[1fr_120px_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  const currentInput = stageInputs[skill.id];
                  if (!currentInput?.title.trim()) return;

                  void createStage({
                    skillId: skill.id,
                    title: currentInput.title.trim(),
                    order: Number(currentInput.order) || 1,
                  });

                  setStageInputs((current) => ({
                    ...current,
                    [skill.id]: { title: '', order: '1' },
                  }));
                }}
              >
                <Input
                  aria-label={`Stage title ${skill.title}`}
                  placeholder="Add a stage"
                  value={stageInputs[skill.id]?.title ?? ''}
                  onChange={(event) =>
                    setStageInputs((current) => ({
                      ...current,
                      [skill.id]: {
                        title: event.target.value,
                        order: current[skill.id]?.order ?? '1',
                      },
                    }))
                  }
                />
                <Input
                  aria-label={`Stage order ${skill.title}`}
                  placeholder="Order"
                  value={stageInputs[skill.id]?.order ?? '1'}
                  onChange={(event) =>
                    setStageInputs((current) => ({
                      ...current,
                      [skill.id]: {
                        title: current[skill.id]?.title ?? '',
                        order: event.target.value,
                      },
                    }))
                  }
                />
                <Button type="submit">Add stage</Button>
              </form>

              <div className="grid gap-3">
                {(stagesBySkillId[skill.id] ?? []).map((stage) => (
                  <div
                    key={stage.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/60 p-4"
                  >
                    <div>
                      {editingStageId === stage.id ? (
                        <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
                          <Input
                            value={editingStageTitle}
                            onChange={(event) =>
                              setEditingStageTitle(event.target.value)
                            }
                            aria-label={`Edit stage ${stage.title}`}
                          />
                          <Input
                            value={editingStageOrder}
                            onChange={(event) =>
                              setEditingStageOrder(event.target.value)
                            }
                            aria-label={`Edit order ${stage.title}`}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              void updateStage({
                                stageId: stage.id,
                                skillId: skill.id,
                                title: editingStageTitle.trim() || stage.title,
                                order: Number(editingStageOrder) || stage.order,
                              });
                              setEditingStageId(null);
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">
                            {stage.order}. {stage.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Stage order {stage.order}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => void markStage(stage.id)}
                      >
                        Mark done
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditingStageId(stage.id);
                          setEditingStageTitle(stage.title);
                          setEditingStageOrder(String(stage.order));
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          void deleteStage({
                            skillId: skill.id,
                            stageId: stage.id,
                          })
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
