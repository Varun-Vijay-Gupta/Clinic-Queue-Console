import React from "react";
import type { QueueEntry, QueueStatus } from "../../types";
import { Button, Badge } from "../ui";
import styles from "./QueueTable.module.css";

export interface QueueTableProps {
  entries: QueueEntry[];
  onViewDetails: (entry: QueueEntry) => void;
  onCallNext: (entry: QueueEntry) => void;
  onMarkServed: (entry: QueueEntry) => void;
  onMarkNoShow: (entry: QueueEntry) => void;
  onMove: (entry: QueueEntry) => void;
  highlightedNewIds: Set<string>;
  longWaitThresholdSeconds?: number;
}

const formatWaitTime = (seconds: number): string => {
  if (seconds > 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  if (seconds > 60) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }
  return `${seconds}s`;
};

const getStatusBadgeVariant = (status: QueueStatus) => {
  switch (status) {
    case "waiting":
      return "waiting" as const;
    case "called":
      return "called" as const;
    case "served":
      return "served" as const;
    case "no-show":
      return "no-show" as const;
    default:
      return "info" as const;
  }
};

const formatStatus = (status: QueueStatus): string => {
  switch (status) {
    case "waiting":
      return "Waiting";
    case "called":
      return "Called";
    case "served":
      return "Served";
    case "no-show":
      return "No-Show";
    default:
      return status;
  }
};

export const QueueTable: React.FC<QueueTableProps> = ({
  entries,
  onViewDetails,
  onCallNext,
  onMarkServed,
  onMarkNoShow,
  onMove,
  highlightedNewIds,
  longWaitThresholdSeconds = 900,
}) => {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table} role="table" aria-label="Queue entries">
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th} scope="col" style={{ width: "5%" }}>
              #
            </th>
            <th className={styles.th} scope="col">
              Customer Name
            </th>
            <th className={styles.th} scope="col">
              Visit Type
            </th>
            <th className={styles.th} scope="col">
              Priority
            </th>
            <th className={styles.th} scope="col">
              Wait Time
            </th>
            <th className={styles.th} scope="col">
              Status
            </th>
            <th className={styles.th} scope="col" style={{ width: "auto" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className={styles.td}
                style={{
                  textAlign: "center",
                  padding: "var(--spacing-8)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                No entries in the queue.
              </td>
            </tr>
          ) : (
            entries.map((entry) => {
              const isNew = highlightedNewIds.has(entry.id);
              const isLongWait = entry.waitTimeSeconds >= longWaitThresholdSeconds;
              const customerName = `${entry.customer.firstName} ${entry.customer.lastName}`;

              const rowClasses = [
                styles.tr,
                isNew ? styles.rowNew : "",
                isLongWait ? styles.rowLongWait : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <tr
                  key={entry.id}
                  className={rowClasses}
                  data-entry-id={entry.id}
                >
                  <td className={styles.td}>
                    <span className={styles.positionBadge}>{entry.position}</span>
                  </td>
                  <td className={styles.td}>
                    <span
                      className={[
                        styles.customerName,
                        isLongWait ? styles.customerNameLongWait : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {isLongWait && (
                        <span className={styles.iconWarning} aria-hidden="true">
                          ⚠️
                        </span>
                      )}
                      <strong>{customerName}</strong>
                    </span>
                  </td>
                  <td className={styles.td}>{entry.visitType}</td>
                  <td className={styles.td}>
                    <Badge variant={entry.priority}>
                      {entry.priority.charAt(0).toUpperCase() + entry.priority.slice(1)}
                    </Badge>
                  </td>
                  <td className={styles.td}>
                    <span
                      className={[
                        styles.waitTimePill,
                        isLongWait ? styles.waitTimeLong : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {isLongWait && (
                        <span className={styles.iconTimer} aria-hidden="true">
                          ⏱️
                        </span>
                      )}
                      {formatWaitTime(entry.waitTimeSeconds)}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <Badge variant={getStatusBadgeVariant(entry.status)}>
                      {formatStatus(entry.status)}
                    </Badge>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actionsRow}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(entry)}
                        aria-label={`View details for ${customerName}`}
                      >
                        View Details
                      </Button>
                      {entry.status === "waiting" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onCallNext(entry)}
                          aria-label={`Call next: ${customerName}`}
                        >
                          Call Next
                        </Button>
                      )}
                      {entry.status === "called" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onMarkServed(entry)}
                          aria-label={`Mark ${customerName} as served`}
                        >
                          Mark Served
                        </Button>
                      )}
                      {(entry.status === "waiting" || entry.status === "called") && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onMarkNoShow(entry)}
                          aria-label={`Mark ${customerName} as no-show`}
                        >
                          Mark No-Show
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMove(entry)}
                        aria-label={`Move ${customerName} to another queue`}
                      >
                        Move
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QueueTable;
