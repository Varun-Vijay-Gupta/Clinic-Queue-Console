# Clinic Queue Console

A frontend queue management system for clinic reception staff. It helps staff see who is waiting, track wait times, and manage the queue.

## What it does

The app provides a live queue with actions to call customers, mark them as served or no-show, and move them between queues or locations. It uses a mocked API, so no real backend is needed.

## Features

* Live queue with position, name, wait time, status, and actions
* Summary cards for waiting, average wait, longest wait, and currently called
* Call Next, Mark Served, Mark No-show, and Move actions
* Customer details in a right-side drawer
* Long-wait warnings using icons, bold text, and warning styling
* Queue polling every 3 seconds
* New-arrival banner without changing the user's scroll position
* Optimistic updates with rollback and retry on API failure
* Simulated API delay and random failures
* Loading, empty, error, and retry states
* 3 clinic locations
* Keyboard support and basic focus management

## Tech Stack

* React 19
* TypeScript
* Vite
* MSW 2 for the mock API
* CSS Modules and CSS variables
* React Context for toasts
* No external UI or state-management library

## Setup

```bash
npm install
npm run dev
npm run build
npm run preview
```

MSW runs in the browser and handles the `/api/*` requests, so no backend is required.

## Project Structure

```text
src/
├── types/          # TypeScript types
├── styles/         # Design tokens and global styles
├── components/
│   ├── ui/         # Reusable UI components
│   └── queue/      # Queue table and customer drawer
├── services/       # API service
├── mocks/          # Mock data and MSW handlers
├── App.tsx         # Main app, polling and queue logic
└── main.tsx        # App entry point
```

The main flow is:

`App.tsx → UI components → api.ts → MSW mock API`

## Important Decisions

### 1. Simple React state

I used React state and context instead of Redux or Zustand because the project is small and does not need a separate state-management library.

### 2. Simple queue table

The main table only shows the information needed to manage the queue. Detailed customer information is available in the drawer.

### 3. Optimistic updates

Actions update the UI immediately. If an API request fails, the previous state is restored and the user gets a retry option. Polling also keeps the optimistic state from being overwritten while an action is still running.

### 4. Long-wait warnings

For waits of 15 minutes or more, I use multiple signals instead of only color: warning icons, bold text, a warning pill, and a row accent.

### 5. New arrivals

New customers are detected during polling and shown through a banner. This avoids suddenly moving the user's scroll position while they are checking the queue.

### 6. Deployment

Vercel : https://clinic-queue-console.vercel.app/
