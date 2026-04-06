# Agent Workflow

## Goal

Agents may be used to research structure, testing strategy, integration details, and other best practices. They are support tools, not decision makers.

## Rules For Agent Usage

1. Use agents for parallel research or large codebase exploration.
2. Do not let agents edit files unless explicitly required.
3. Treat agent output as guidance that must be validated against the current repository.
4. Consolidate agent findings into minimal code changes.

## Output Expectations

When an agent is launched, request:
1. actionable recommendations
2. concrete tradeoffs
3. file or module suggestions when relevant
4. risks and edge cases for the proposed approach

## Working Agreement

1. Shared business logic remains the source of truth.
2. API and bot adapters should not fork behavior.
3. Frontend charts should consume prepared data contracts where practical.
4. Prefer the smallest correct implementation for each iteration.

## Review Checklist

Before accepting agent guidance, verify:
1. it matches the current stack
2. it does not add unnecessary abstractions
3. it keeps the MVP scope intact
4. it improves testability or maintainability
