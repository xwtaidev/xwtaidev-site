---
title: "The work between working and done"
description: "Empty states, keyboard paths, and the little details that make a small tool feel considered."
date: "2026-08-26"
category: "Building"
tags: ["Interaction design", "Shipping", "Craft"]
format: "quote"
pullQuote: "The edges help people trust the work."
draft: false
sample: true
---

There is a point in a project when the main feature works and the tool still feels unfinished. The happy path is there. The edges are where the remaining work lives.

I have started treating those edges as a distinct part of building: the first launch, the wrong input, the slow operation, and the way back after a mistake.

## Begin with nothing

A developer usually sees an app full of test data. A new user often sees an empty screen. That first encounter should explain what belongs here and give them one useful next action.

I like empty states that describe the situation plainly. ‘No notes match this filter’ is different from ‘Create your first note.’ One asks for a change to the view; the other invites new work.

> [!NOTE] A quick check
>
> Remove the test data and open the app again. Does the screen still make sense?

## Follow the keyboard

Moving through an interface with a keyboard reveals its structure. Focus should go somewhere sensible when a panel opens and return somewhere sensible when it closes.

- Tab through the main task without using the mouse.
- Check that focused controls are visible.
- Dismiss a dialog and check where focus returns.
- Try the same path after an error.

These checks often uncover problems that affect pointer interactions too: unclear controls, hidden actions, and elements whose purpose depends entirely on their position.

## Make recovery ordinary

People rename files, close windows, and click the wrong thing. A considered tool makes these moments recoverable. An error should explain what happened and offer the next step that is actually available.

> The main feature gets someone started. The edges help them trust it.

There is always more polish available than time. I try to spend it where someone might otherwise feel lost, stuck, or unsure whether their work is safe. Those details tend to matter long after the first impression.
