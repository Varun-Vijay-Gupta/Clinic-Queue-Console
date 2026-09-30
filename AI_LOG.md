# AI Log

I used the built-in Trae agent during this assessment. I did not use ChatGPT, Copilot, Claude, Gemini, or any other external AI tools.

## AI Used

I used the Trae agent for 3 main tasks:

1. **UI Components** – Button, Badge, SummaryCard, Toast, EmptyState, Loading/Error State, and Select.
2. **MSW Mock API** – Seed data, helpers, 7 REST handlers, and browser worker setup.
3. **Queue Components** – QueueTable and CustomerDrawer with CSS modules.

I wrote the types, styles, `App.tsx`, documentation files, and bug fixes manually.

## Main Prompts

The prompts mainly asked the agent to:

* Create React + TypeScript UI components using the existing design tokens.
* Add proper buttons, tables, ARIA attributes, focus states, and keyboard support.
* Create MSW mock data and REST handlers with simulated delays and errors.
* Build the queue table and customer drawer according to the assignment requirements.

I did not save the exact prompts because the Trae agent calls are available in the IDE session history.

## AI Output vs Final Code

The AI initially handled the long-wait customer styling mainly with a warning color. I changed this manually because the requirement said the warning should not depend only on color.

I added:

* ⚠️ warning icon
* Bold customer name
* Warning-style wait-time background
* Row border/accent

This made the warning easier to understand and also improved accessibility.

I also fixed some integration issues manually, such as:

* Select `onChange` mismatch
* Badge variant mismatches
* Optimistic UI state being overwritten by polling

## What AI Helped With

AI was useful for repetitive work such as:

* CSS modules
* Mock customer data
* TypeScript interfaces
* Component structure
* Basic UI variants
* Keyboard and Escape-key handling

The main issues were with connecting different components and understanding the complete application flow. I had to test the code, find build/runtime issues, and fix them manually.

Overall, AI helped with most of the initial implementation, but I reviewed and modified the generated code before using it.
