import type {
  Location,
  QueueEntry,
  QueueSummary,
} from "../types";

const API_BASE = "/api";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message ?? err?.error ?? message;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  const body = await res.json();
  return body.data as T;
}

export const api = {
  getLocations: () => request<Location[]>("/locations"),

  getQueue: (locationId: string) =>
    request<QueueEntry[]>(`/locations/${locationId}/queue`),

  getSummary: (locationId: string) =>
    request<QueueSummary>(`/locations/${locationId}/summary`),

  callNext: (entryId: string) =>
    request<QueueEntry[]>(`/queue/${entryId}/call-next`, {
      method: "POST",
    }),

  markServed: (entryId: string) =>
    request<QueueEntry>(`/queue/${entryId}/mark-served`, {
      method: "POST",
    }),

  markNoShow: (entryId: string) =>
    request<QueueEntry>(`/queue/${entryId}/mark-no-show`, {
      method: "POST",
    }),

  moveEntry: (
    entryId: string,
    payload: { targetQueue: string; targetLocationId?: string },
  ) =>
    request<QueueEntry>(`/queue/${entryId}/move`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
