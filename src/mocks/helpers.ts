import type { QueueEntry, QueueSummary } from '../types';

export async function simulateNetwork(): Promise<void> {
  const delay = Math.floor(Math.random() * 501) + 300;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.1) {
        reject(new Error('Network error: please try again'));
      } else {
        resolve();
      }
    }, delay);
  });
}

export function cloneData<T>(data: T): T {
  return structuredClone(data);
}

export function computeWaitTime(checkInTimeISO: string): number {
  const checkIn = new Date(checkInTimeISO).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - checkIn) / 1000));
}

export function updateWaitTimes(entries: QueueEntry[]): QueueEntry[] {
  return entries.map((entry) => ({
    ...entry,
    waitTimeSeconds: computeWaitTime(entry.checkInTime),
  }));
}

export function computeSummary(
  locationId: string,
  entries: QueueEntry[]
): QueueSummary {
  const locationEntries = entries.filter((e) => e.locationId === locationId);
  const waitingEntries = locationEntries.filter((e) => e.status === 'waiting');
  const calledEntries = locationEntries.filter((e) => e.status === 'called');
  const servedEntries = locationEntries.filter((e) => e.status === 'served');
  const noShowEntries = locationEntries.filter((e) => e.status === 'no-show');

  const waitTimes = waitingEntries.map((e) => computeWaitTime(e.checkInTime));
  const averageWaitTimeSeconds =
    waitTimes.length > 0
      ? Math.floor(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
      : 0;
  const longestWaitTimeSeconds =
    waitTimes.length > 0 ? Math.max(...waitTimes) : 0;

  return {
    locationId,
    waitingCount: waitingEntries.length,
    calledCount: calledEntries.length,
    servedCount: servedEntries.length,
    noShowCount: noShowEntries.length,
    averageWaitTimeSeconds,
    longestWaitTimeSeconds,
  };
}

export function reorderPositions(entries: QueueEntry[]): QueueEntry[] {
  const groups = new Map<string, QueueEntry[]>();

  for (const entry of entries) {
    const key = `${entry.locationId}-${entry.queueName}-${entry.status}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(entry);
  }

  const result: QueueEntry[] = [];

  for (const [, group] of groups) {
    if (group[0].status === 'waiting' || group[0].status === 'called') {
      group.sort(
        (a, b) =>
          new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime()
      );
      group.forEach((entry, index) => {
        result.push({ ...entry, position: index + 1 });
      });
    } else {
      group.forEach((entry) => {
        result.push({ ...entry, position: 0 });
      });
    }
  }

  return result;
}
