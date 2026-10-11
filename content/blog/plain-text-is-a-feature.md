---
title: "Plain text is a feature"
description: "Why I keep coming back to Markdown files and tools that leave the door open."
date: "2026-09-24"
category: "Engineering"
tags: ["Obsidian", "Local-first", "Markdown"]
cover: "markdown"
draft: false
sample: true
---

A note should still be a note when the app that created it is closed. That simple expectation influences a surprising number of the decisions I make while building tools for Obsidian.

Plain text is easy to take for granted. It is also a useful product constraint: the interface can change, but the work underneath should remain understandable.

## Files as the foundation

When a task lives in a Markdown file, it has a life outside the view that displays it. I can open it in another editor, include it in a backup, or use a script to move it somewhere else.

That independence shapes the plugin. A board becomes a different way to look at existing notes. A weekly planner becomes a way to arrange tasks that are still readable in a folder.

```markdown title="a-small-idea.md"
---
title: A small idea
status: in-progress
---

## Next step

- [ ] Make the first version useful
- [ ] Try it during a real workday
```

The file is deliberately ordinary. It does not need the original interface to explain what the task is or where it stands.

## A view, not a container

I think of a plugin view as a lens. It can reveal relationships, group notes, and make a repeated action easier. It should be careful about becoming the only place where those notes make sense.

Moving a card on a board can update a status property. The visual interaction is richer than editing a word, but the underlying result stays small and inspectable.

> A good interface can make a file more useful without making the file dependent on the interface.

## The tradeoffs are real

Files do not make every engineering problem disappear. A user can rename a property, edit a task while a view is open, or introduce an unexpected format. The interface has to make room for those changes.

- Read the current file before applying a change.
- Preserve content the tool does not own.
- Show a recoverable state when a property is missing.
- Treat edits made elsewhere as normal behavior.

These constraints add work. They also keep the relationship clear: the tool helps with the data, and the person keeps control of it.

## Leave the door open

I want people to choose an interface because it is useful today. Knowing that their notes can leave tomorrow is part of what makes that choice comfortable.

Plain text is not a universal answer. For the small, personal tools I like to make, it is a foundation I am happy to keep building on.
