import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import { useSkills } from '../features/skills/skills-context';
import { useTelegramMainButton } from '../features/telegram-webapp/telegram-sdk';

export const TelegramSkillsPage = () => {
  const {
    skills,
    createSkill,
    stagesBySkillId,
    createStage,
    markStage,
    deleteSkill,
    deleteStage,
    updateSkill,
  } = useSkills();
  const [title, setTitle] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [stageTitle, setStageTitle] = useState('');
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSkillTitle, setEditingSkillTitle] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    void createSkill({ title: title.trim() });
    setTitle('');
  };

  useTelegramMainButton({
    enabled: title.trim().length > 0,
    text: 'Create skill',
    onClick: submit,
  });

  return (
    <main className="tg-page">
      <Card className="bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2">
            <Input
              placeholder="New skill"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Button onClick={submit}>Add skill</Button>
          </div>

          <div className="grid gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="rounded-lg border border-border bg-background/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    {editingSkillId === skill.id ? (
                      <div className="grid gap-2">
                        <Input
                          value={editingSkillTitle}
                          onChange={(event) =>
                            setEditingSkillTitle(event.target.value)
                          }
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            void updateSkill({
                              skillId: skill.id,
                              title: editingSkillTitle.trim() || skill.title,
                            });
                            setEditingSkillId(null);
                            setEditingSkillTitle('');
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium">{skill.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {skill.category ?? 'Uncategorized'}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedSkillId(skill.id)}
                    >
                      Open
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditingSkillId(skill.id);
                        setEditingSkillTitle(skill.title);
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
              </div>
            ))}
          </div>

          {selectedSkillId ? (
            <Card className="bg-background/60">
              <CardContent className="grid gap-3 p-4">
                <p className="font-medium">Stages</p>
                <div className="grid gap-2">
                  <Input
                    placeholder="New stage"
                    value={stageTitle}
                    onChange={(event) => setStageTitle(event.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (!stageTitle.trim()) return;
                      void createStage({
                        skillId: selectedSkillId,
                        title: stageTitle.trim(),
                        order: 1,
                      });
                      setStageTitle('');
                    }}
                  >
                    Add stage
                  </Button>
                </div>
                <div className="grid gap-2">
                  {(stagesBySkillId[selectedSkillId] ?? []).map((stage) => (
                    <div
                      key={stage.id}
                      className="rounded-lg border border-border bg-card/70 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {stage.order}. {stage.title}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => void markStage(stage.id)}
                        >
                          Done
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            void deleteStage({
                              skillId: selectedSkillId,
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
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
};
