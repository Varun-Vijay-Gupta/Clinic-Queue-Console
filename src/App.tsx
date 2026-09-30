import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Badge,
  SummaryCard,
  ToastContainer,
  useToast,
  EmptyState,
  LoadingErrorState,
  Select,
  ToastProvider,
} from "./components/ui";
import { QueueTable, CustomerDrawer } from "./components/queue";
import { api } from "./services/api";
import type {
  Location,
  QueueEntry,
  QueueStatus,
  QueueSummary,
} from "./types";
import "./styles/app.css";

const POLL_INTERVAL_MS = 3000;
const LONG_WAIT_THRESHOLD_SECONDS = 15 * 60;
const QUEUE_NAMES = [
  "General Consultation",
  "Lab Work",
  "Vaccination",
];

function formatDuration(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function computeEntriesSummary(entries: QueueEntry[]): QueueSummary {
  const waiting = entries.filter((e) => e.status === "waiting");
  const called = entries.filter((e) => e.status === "called");
  const served = entries.filter((e) => e.status === "served");
  const noShow = entries.filter((e) => e.status === "no-show");
  const waits = waiting.map((e) => e.waitTimeSeconds);
  return {
    locationId: "",
    waitingCount: waiting.length,
    calledCount: called.length,
    servedCount: served.length,
    noShowCount: noShow.length,
    averageWaitTimeSeconds:
      waits.length === 0 ? 0 : Math.round(waits.reduce((a, b) => a + b, 0) / waits.length),
    longestWaitTimeSeconds: waits.length === 0 ? 0 : Math.max(...waits),
  };
}

interface DashboardProps {
  locationId: string;
  locations: Location[];
  onLocationChange: (id: string) => void;
}

function Dashboard({ locationId, locations, onLocationChange }: DashboardProps) {
  const { showToast, hideToast } = useToast();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [summary, setSummary] = useState<QueueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueFilter, setQueueFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<QueueStatus | "all">("waiting");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [pendingDrawerShowMove, setPendingDrawerShowMove] = useState(false);
  const [, setPendingActionIds] = useState<Set<string>>(new Set());
  const [newUnseenIds, setNewUnseenIds] = useState<Set<string>>(new Set());
  const [highlightedNewIds, setHighlightedNewIds] = useState<Set<string>>(new Set());
  const [callNextLoading, setCallNextLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef(0);
  const previousIdsRef = useRef<Set<string>>(new Set());
  const pendingOptimisticRef = useRef<Set<string>>(new Set());
  const lastFetchRef = useRef<QueueEntry[]>([]);

  const saveScroll = useCallback(() => {
    if (scrollRef.current) {
      scrollTopRef.current = scrollRef.current.scrollTop;
    }
  }, []);

  const restoreScroll = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollTopRef.current;
    }
  }, []);

  const fetchAll = useCallback(
    async (showErrorOnFail = false) => {
      try {
        const [queueRes, summaryRes] = await Promise.all([
          api.getQueue(locationId),
          api.getSummary(locationId),
        ]);

        const fetchedIds = new Set(queueRes.map((e) => e.id));
        const prevIds = previousIdsRef.current;
        const justArrived = new Set<string>();
        fetchedIds.forEach((id) => {
          if (
            prevIds.size > 0 &&
            !prevIds.has(id) &&
            !pendingOptimisticRef.current.has(id)
          ) {
            justArrived.add(id);
          }
        });

        saveScroll();

        if (pendingOptimisticRef.current.size > 0) {
          setEntries((current) => {
            const optimisticById = new Map(
              current
                .filter((e) => pendingOptimisticRef.current.has(e.id))
                .map((e) => [e.id, e]),
            );
            const merged = queueRes.map((fetched) => {
              const optimistic = optimisticById.get(fetched.id);
              return optimistic ?? fetched;
            });
            current.forEach((curr) => {
              if (
                pendingOptimisticRef.current.has(curr.id) &&
                !fetchedIds.has(curr.id)
              ) {
                merged.push(curr);
              }
            });
            return merged;
          });
        } else {
          setEntries(queueRes);
        }

        setSummary(summaryRes);

        if (justArrived.size > 0) {
          setNewUnseenIds((prev) => {
            const next = new Set(prev);
            justArrived.forEach((id) => next.add(id));
            return next;
          });
          setHighlightedNewIds((prev) => {
            const next = new Set(prev);
            justArrived.forEach((id) => next.add(id));
            return next;
          });
          setTimeout(() => {
            setHighlightedNewIds((prev) => {
              const next = new Set(prev);
              justArrived.forEach((id) => next.delete(id));
              return next;
            });
          }, 4000);
        }

        previousIdsRef.current = fetchedIds;
        lastFetchRef.current = queueRes;
        setError(null);
        setLoading(false);

        requestAnimationFrame(() => restoreScroll());
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load queue";
        if (showErrorOnFail) {
          setError(msg);
        }
        setLoading(false);
      }
    },
    [locationId, saveScroll, restoreScroll],
  );

  useEffect(() => {
    setEntries([]);
    setSummary(null);
    setLoading(true);
    setError(null);
    previousIdsRef.current = new Set();
    pendingOptimisticRef.current = new Set();
    lastFetchRef.current = [];
    setNewUnseenIds(new Set());
    setHighlightedNewIds(new Set());
    fetchAll(true);
  }, [locationId, fetchAll]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void fetchAll(false);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [fetchAll]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setEntries((curr) =>
        curr.map((e) =>
          e.status === "waiting" || e.status === "called"
            ? {
                ...e,
                waitTimeSeconds: Math.floor(
                  (Date.now() - new Date(e.checkInTime).getTime()) / 1000,
                ),
              }
            : e,
        ),
      );
      setSummary((s) =>
        s ? computeEntriesSummary(entries) : s,
      );
    }, 1000);
    return () => window.clearInterval(interval);
  }, [entries]);

  const markPending = (id: string, pending: boolean) => {
    setPendingActionIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
    pendingOptimisticRef.current = new Set(pendingOptimisticRef.current);
    if (pending) pendingOptimisticRef.current.add(id);
    else pendingOptimisticRef.current.delete(id);
  };

  const performAction = async <T,>(
    opts: {
      actionId: string;
      optimisticMutator?: (e: QueueEntry) => QueueEntry;
      rollbackSnapshot?: QueueEntry[];
      apiCall: () => Promise<T>;
      successMessage: string;
      errorMessage: string;
      onSuccess?: (result: T) => void;
      fallbackRollback?: () => void;
    },
  ) => {
    const {
      actionId,
      optimisticMutator,
      rollbackSnapshot,
      apiCall,
      successMessage,
      errorMessage,
      onSuccess,
      fallbackRollback,
    } = opts;

    const snapshot = rollbackSnapshot ?? [...entries];
    markPending(actionId, true);
    if (optimisticMutator) {
      setEntries((curr) =>
        curr.map((e) => (e.id === actionId ? optimisticMutator(e) : e)),
      );
    }

    try {
      const result = await apiCall();
      showToast({ type: "success", message: successMessage });
      if (onSuccess) onSuccess(result);
      pendingOptimisticRef.current.delete(actionId);
      previousIdsRef.current = new Set(entries.map((e) => e.id));
      await fetchAll(false);
      return result;
    } catch (err) {
      if (snapshot) {
        setEntries(snapshot);
      } else if (fallbackRollback) {
        fallbackRollback();
      }
      const msg =
        err instanceof Error ? err.message : errorMessage;
      const retryId = `retry-${actionId}-${Date.now()}`;
      showToast({
        type: "error",
        message: `${errorMessage}: ${msg}`,
        retryAction: () => {
          hideToast(retryId);
          void performAction(opts);
        },
        retryLabel: "Retry",
      });
      return null;
    } finally {
      markPending(actionId, false);
    }
  };

  const handleCallNext = useCallback(
    async (anchorEntry: QueueEntry) => {
      const snapshot = [...entries];
      const waitingInQueue = entries
        .filter(
          (e) =>
            e.status === "waiting" &&
            e.locationId === anchorEntry.locationId &&
            e.queueName === anchorEntry.queueName,
        )
        .sort(
          (a, b) =>
            new Date(a.checkInTime).getTime() - new Date(b.checkInTime).getTime(),
        );
      const target = waitingInQueue[0];
      if (!target) {
        showToast({
          type: "info",
          message: "No customers waiting in this queue",
        });
        return;
      }
      setCallNextLoading(true);
      const actionId = target.id;
      markPending(actionId, true);
      const optimisticEntries = entries.map((e) =>
        e.id === target.id
          ? { ...e, status: "called" as QueueStatus, calledTime: new Date().toISOString() }
          : e,
      );
      setEntries(optimisticEntries);

      try {
        await api.callNext(target.id);
        showToast({
          type: "success",
          message: `Called ${target.customer.firstName} ${target.customer.lastName}`,
        });
        pendingOptimisticRef.current.delete(actionId);
        await fetchAll(false);
      } catch (err) {
        setEntries(snapshot);
        const msg = err instanceof Error ? err.message : "Could not call next";
        const retryKey = `retry-callnext-${target.id}`;
        showToast({
          type: "error",
          message: `Failed to call next: ${msg}`,
          retryAction: () => {
            hideToast(retryKey);
            void handleCallNext(anchorEntry);
          },
          retryLabel: "Retry",
        });
      } finally {
        markPending(actionId, false);
        setCallNextLoading(false);
      }
    },
    [entries, fetchAll, showToast, hideToast],
  );

  const handleMarkServed = useCallback(
    (entry: QueueEntry) => {
      void performAction({
        actionId: entry.id,
        optimisticMutator: (e) => ({
          ...e,
          status: "served",
          servedTime: new Date().toISOString(),
        }),
        apiCall: () => api.markServed(entry.id),
        successMessage: `${entry.customer.firstName} ${entry.customer.lastName} marked as served`,
        errorMessage: "Failed to mark as served",
      });
    },
    [entries, performAction, showToast],
  );

  const handleMarkNoShow = useCallback(
    (entry: QueueEntry) => {
      void performAction({
        actionId: entry.id,
        optimisticMutator: (e) => ({ ...e, status: "no-show" }),
        apiCall: () => api.markNoShow(entry.id),
        successMessage: `${entry.customer.firstName} ${entry.customer.lastName} marked as no-show`,
        errorMessage: "Failed to mark as no-show",
      });
    },
    [entries, performAction, showToast],
  );

  const handleMove = useCallback(
    (entry: QueueEntry, targetQueue: string, targetLocationId?: string) => {
      void performAction({
        actionId: entry.id,
        optimisticMutator: (e) => ({
          ...e,
          queueName: targetQueue,
          locationId: targetLocationId ?? e.locationId,
          status: "waiting",
        }),
        apiCall: () =>
          api.moveEntry(entry.id, { targetQueue, targetLocationId }),
        successMessage: `Moved ${entry.customer.firstName} to ${targetQueue}`,
        errorMessage: "Failed to move customer",
        onSuccess: () => {
          setDrawerOpen(false);
          setPendingDrawerShowMove(false);
        },
      });
    },
    [entries, performAction, showToast],
  );

  const handleViewDetails = useCallback((entry: QueueEntry) => {
    setSelectedEntry(entry);
    setDrawerOpen(true);
  }, []);

  const handleDismissNewCustomers = () => {
    setNewUnseenIds(new Set());
  };

  const visibleEntries = useMemo(() => {
    return entries
      .filter((e) => (queueFilter === "all" ? true : e.queueName === queueFilter))
      .filter((e) =>
        statusFilter === "all" ? true : e.status === statusFilter,
      )
      .sort((a, b) => {
        const statusOrder: Record<QueueStatus, number> = {
          called: 0,
          waiting: 1,
          served: 2,
          "no-show": 3,
        };
        if (statusOrder[a.status] !== statusOrder[b.status])
          return statusOrder[a.status] - statusOrder[b.status];
        return a.position - b.position;
      });
  }, [entries, queueFilter, statusFilter]);

  const hasWaiting = entries.some((e) => e.status === "waiting");

  const longestWaitBadge =
    summary && summary.longestWaitTimeSeconds >= LONG_WAIT_THRESHOLD_SECONDS
      ? true
      : false;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-brand">
            <div className="app-brand-mark" aria-hidden="true">+</div>
            <div>
              <h1 className="app-title">Clinic Queue Console</h1>
              <p className="app-subtitle">Front-desk queue management</p>
            </div>
          </div>
          <div className="app-header-controls">
            <label className="location-select-label" htmlFor="location-select">
              Location
            </label>
            <Select
              id="location-select"
              value={locationId}
              onChange={(val) => onLocationChange(val)}
              options={locations.map((l) => ({ value: l.id, label: l.name }))}
              ariaLabel="Select clinic location"
            />
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="page-header">
          <div>
            <h2 className="page-title">
              {locations.find((l) => l.id === locationId)?.name ?? "Queue"}
            </h2>
            <p className="page-description">
              Live queue — auto-refreshes every 3 seconds. New arrivals are marked below.
            </p>
          </div>
          <div className="page-header-actions">
            <Button
              variant="primary"
              onClick={() => {
                const first = entries
                  .filter((e) => e.status === "waiting")
                  .sort(
                    (a, b) =>
                      new Date(a.checkInTime).getTime() -
                      new Date(b.checkInTime).getTime(),
                  )[0];
                if (first) void handleCallNext(first);
              }}
              disabled={!hasWaiting || callNextLoading}
              loading={callNextLoading}
              ariaLabel="Call next waiting customer globally"
            >
              Call Next
            </Button>
          </div>
        </section>

        {newUnseenIds.size > 0 && (
          <div
            className="new-arrivals-banner"
            role="status"
            aria-live="polite"
          >
            <span aria-hidden="true">✨</span>
            <span>
              {newUnseenIds.size} new customer{newUnseenIds.size === 1 ? "" : "s"} arrived
              since you last checked
            </span>
            <Button variant="ghost" size="sm" onClick={handleDismissNewCustomers}>
              Dismiss
            </Button>
          </div>
        )}

        <section className="summary-grid" aria-label="Queue summary">
          <SummaryCard
            label="Customers Waiting"
            value={(summary?.waitingCount ?? 0).toString()}
            accentColor="var(--color-accent-primary)"
            icon={<span aria-hidden="true">👥</span>}
          />
          <SummaryCard
            label="Average Wait Time"
            value={formatDuration(summary?.averageWaitTimeSeconds ?? 0)}
            accentColor="var(--color-info-text)"
            icon={<span aria-hidden="true">⏱️</span>}
          />
          <SummaryCard
            label="Longest Wait"
            value={formatDuration(summary?.longestWaitTimeSeconds ?? 0)}
            accentColor={
              longestWaitBadge
                ? "var(--color-text-warning)"
                : "var(--color-success-text)"
            }
            icon={
              <span aria-hidden="true">
                {longestWaitBadge ? "⚠️" : "⏳"}
              </span>
            }
          />
          <SummaryCard
            label="Currently Called"
            value={(summary?.calledCount ?? 0).toString()}
            accentColor="var(--color-text-success)"
            icon={<span aria-hidden="true">📣</span>}
          />
        </section>

        <section className="filters-row" aria-label="Filter queue">
          <div className="filter-group" role="tablist" aria-label="Queue filter">
            {(["all", ...QUEUE_NAMES] as const).map((q) => (
              <button
                key={q}
                role="tab"
                aria-selected={queueFilter === q}
                className={`filter-tab ${queueFilter === q ? "filter-tab-active" : ""}`}
                onClick={() => setQueueFilter(q)}
              >
                {q === "all" ? "All Queues" : q}
                <Badge variant="info">
                  {q === "all"
                    ? entries.filter((e) => e.status !== "served" && e.status !== "no-show").length
                    : entries.filter((e) => e.queueName === q && e.status !== "served" && e.status !== "no-show").length}
                </Badge>
              </button>
            ))}
          </div>
          <div className="filter-group">
            <label htmlFor="status-filter" className="visually-hidden">
              Status filter
            </label>
            <Select
              id="status-filter"
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as QueueStatus | "all")}
              options={[
                { value: "waiting", label: "Waiting only" },
                { value: "called", label: "Called only" },
                { value: "served", label: "Served" },
                { value: "no-show", label: "No-shows" },
                { value: "all", label: "All statuses" },
              ]}
            />
          </div>
        </section>

        <LoadingErrorState
          loading={loading}
          error={error}
          onRetry={() => fetchAll(true)}
          loadingMessage="Loading queue..."
        >
          <div
            ref={scrollRef}
            className="table-wrapper"
            onScroll={saveScroll}
            role="region"
            aria-label="Queue table"
          >
            {visibleEntries.length === 0 ? (
              <EmptyState
                title={
                  statusFilter === "served" || statusFilter === "no-show"
                    ? "No records yet"
                    : statusFilter === "all"
                    ? "Queue is empty"
                    : "No-one waiting here"
                }
                description={
                  error
                    ? "Refresh to load the latest queue state."
                    : "New arrivals will appear at the top of the list automatically."
                }
                action={
                  <Button variant="primary" onClick={() => fetchAll(true)}>
                    Refresh Queue
                  </Button>
                }
              />
            ) : (
              <QueueTable
                entries={visibleEntries}
                onViewDetails={handleViewDetails}
                onCallNext={handleCallNext}
                onMarkServed={handleMarkServed}
                onMarkNoShow={handleMarkNoShow}
                onMove={(entry) => {
                  setSelectedEntry(entry);
                  setDrawerOpen(true);
                  setPendingDrawerShowMove(true);
                }}
                highlightedNewIds={highlightedNewIds}
                longWaitThresholdSeconds={LONG_WAIT_THRESHOLD_SECONDS}
              />
            )}
          </div>
        </LoadingErrorState>
      </main>

      <CustomerDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setPendingDrawerShowMove(false);
        }}
        entry={selectedEntry}
        onCallNext={handleCallNext}
        onMarkServed={handleMarkServed}
        onMarkNoShow={handleMarkNoShow}
        onMove={handleMove}
        queueNames={QUEUE_NAMES}
        locations={locations}
        initialShowMoveOptions={pendingDrawerShowMove}
      />
    </div>
  );
}

function AppShell() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const result = await api.getLocations();
        setLocations(result);
        if (result.length > 0 && !locationId) {
          setLocationId(result[0].id);
        }
        setLoading(false);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to load locations";
        setError(msg);
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ToastProvider>
      <LoadingErrorState
        loading={loading}
        error={error}
        onRetry={() => window.location.reload()}
        loadingMessage="Loading locations..."
      >
        {locations.length > 0 && locationId ? (
          <Dashboard
            locationId={locationId}
            locations={locations}
            onLocationChange={setLocationId}
          />
        ) : null}
      </LoadingErrorState>
      <ToastContainer />
    </ToastProvider>
  );
}

export default function App() {
  return <AppShell />;
}
