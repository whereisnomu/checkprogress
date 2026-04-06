import { SkillPanel } from '../features/skills/skill-panel';

export const SkillsPage = () => (
  <main className="page-shell">
    <section className="hero-card hero-card--compact">
      <p className="eyebrow">Skill Workspace</p>
      <h1>Track skills and progressive stages</h1>
      <p className="hero-copy">
        Define what you are learning, break it into stages, and mark milestones
        as achieved.
      </p>
    </section>

    <SkillPanel />
  </main>
);
