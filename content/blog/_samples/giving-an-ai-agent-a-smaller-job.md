---
title: "Giving an AI agent a smaller job"
description: "A few thoughts on explicit boundaries, visible state, and knowing when to stop."
date: "2026-09-17"
category: "Engineering"
tags: ["AI agents", "Developer tools", "TypeScript"]
cover: "agent"
draft: false
sample: true
---

When an agent workflow gets difficult to understand, my first instinct is usually to give the agent a smaller job. A narrower task is easier to explain, observe, and interrupt.

I have been exploring what that might mean for a personal AI workspace: tools that help move a task forward while making the next action visible.

## Define the finish line

A request like ‘organize this project’ contains many hidden decisions. Which files count? What should change? What would tell us the work is done? An agent can make assumptions about those questions, but the assumptions are still there.

A smaller task can carry its own finish line: inspect these files, suggest three groups, and wait before moving anything. The output is concrete enough to review, and the next step remains a separate decision.

```typescript title="task.ts"
type Task = {
  goal: string;
  allowedPaths: string[];
  state: "ready" | "working" | "review" | "done";
  result?: string;
};

const task: Task = {
  goal: "Suggest groups for my project notes",
  allowedPaths: ["notes/projects/"],
  state: "ready",
};
```

## Make state visible

A conversation is useful context, but it is a poor substitute for an explicit task state. I want to be able to see what is running, what is waiting for me, and what has actually finished without rereading a long thread.

That suggests a small set of visible states and a result attached to the task. A failed attempt should remain understandable too: what was tried, what changed, and what still needs attention.

> [!NOTE] A design question
>
> If I step away for ten minutes, can I understand the current state when I come back?

## Keep interruption simple

Stopping is part of an interaction, not an exceptional case. A person may change their mind, notice a mistaken assumption, or simply want to take over.

- Keep the current action visible.
- Make pending changes inspectable.
- Offer a clear way to pause or cancel.
- Keep enough context to resume deliberately.

I am still experimenting with these boundaries. Smaller jobs give me a useful place to start: fewer hidden decisions, clearer results, and more opportunities to check that the tool is helping.
