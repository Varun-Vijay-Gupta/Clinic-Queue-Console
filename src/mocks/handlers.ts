import { http, HttpResponse } from 'msw';
import type { QueueEntry } from '../types';
import { locations, initialQueueEntries } from './data';
import {
  simulateNetwork,
  cloneData,
  updateWaitTimes,
  computeSummary,
  reorderPositions,
} from './helpers';

let queueEntries: QueueEntry[] = cloneData(initialQueueEntries);

export const handlers = [
  http.get('/api/locations', async () => {
    await simulateNetwork();
    return HttpResponse.json({ data: cloneData(locations) });
  }),

  http.get('/api/locations/:locationId/queue', async ({ params }) => {
    await simulateNetwork();
    const { locationId } = params;
    let entries = queueEntries.filter((e) => e.locationId === locationId);
    entries = updateWaitTimes(entries);
    return HttpResponse.json({ data: cloneData(entries) });
  }),

  http.get('/api/locations/:locationId/summary', async ({ params }) => {
    await simulateNetwork();
    const { locationId } = params;
    const summary = computeSummary(locationId as string, queueEntries);
    return HttpResponse.json({ data: cloneData(summary) });
  }),

  http.post('/api/queue/:entryId/call-next', async ({ params }) => {
    await simulateNetwork();
    const { entryId } = params;

    const currentEntry = queueEntries.find((e) => e.id === entryId);
    if (!currentEntry) {
      return HttpResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    const targetLocationId = currentEntry.locationId;
    const targetQueueName = currentEntry.queueName;

    const waitingEntries = queueEntries.filter(
      (e) =>
        e.locationId === targetLocationId &&
        e.queueName === targetQueueName &&
        e.status === 'waiting'
    );

    waitingEntries.sort(
      (a, b) =>
        new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
    );

    const nextEntry = waitingEntries[0];
    if (!nextEntry) {
      return HttpResponse.json({ data: cloneData([]) });
    }

    nextEntry.status = 'called';
    nextEntry.calledTime = new Date().toISOString();

    queueEntries = reorderPositions(queueEntries);

    return HttpResponse.json({ data: cloneData(queueEntries) });
  }),

  http.post('/api/queue/:entryId/mark-served', async ({ params }) => {
    await simulateNetwork();
    const { entryId } = params;

    const entry = queueEntries.find((e) => e.id === entryId);
    if (!entry) {
      return HttpResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    entry.status = 'served';
    entry.servedTime = new Date().toISOString();

    queueEntries = reorderPositions(queueEntries);

    return HttpResponse.json({ data: cloneData(entry) });
  }),

  http.post('/api/queue/:entryId/mark-no-show', async ({ params }) => {
    await simulateNetwork();
    const { entryId } = params;

    const entry = queueEntries.find((e) => e.id === entryId);
    if (!entry) {
      return HttpResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    entry.status = 'no-show';

    queueEntries = reorderPositions(queueEntries);

    return HttpResponse.json({ data: cloneData(entry) });
  }),

  http.post('/api/queue/:entryId/move', async ({ params, request }) => {
    await simulateNetwork();
    const { entryId } = params;
    const body = (await request.json()) as {
      targetQueue: string;
      targetLocationId?: string;
    };

    const entry = queueEntries.find((e) => e.id === entryId);
    if (!entry) {
      return HttpResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    entry.queueName = body.targetQueue;
    if (body.targetLocationId) {
      entry.locationId = body.targetLocationId;
    }
    entry.status = 'waiting';
    entry.calledTime = null;
    entry.servedTime = null;

    queueEntries = reorderPositions(queueEntries);

    return HttpResponse.json({ data: cloneData(entry) });
  }),
];
