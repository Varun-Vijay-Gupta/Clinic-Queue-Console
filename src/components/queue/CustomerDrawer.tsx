import React, { useEffect, useRef, useState } from "react";
import type { QueueEntry, QueueStatus, Location } from "../../types";
import { Button, Badge, LoadingErrorState, Select } from "../ui";
import styles from "./CustomerDrawer.module.css";

export interface CustomerDrawerProps {
  open: boolean;
  onClose: () => void;
  entry: QueueEntry | null;
  onCallNext?: (entry: QueueEntry) => void;
  onMarkServed?: (entry: QueueEntry) => void;
  onMarkNoShow?: (entry: QueueEntry) => void;
  onMove?: (entry: QueueEntry, targetQueue: string, targetLocation: string) => void;
  queueNames: string[];
  locations: Location[];
  initialShowMoveOptions?: boolean;
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

const formatCheckInTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};

const formatDateOfBirth = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return isoString;
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

export const CustomerDrawer: React.FC<CustomerDrawerProps> = ({
  open,
  onClose,
  entry,
  onCallNext,
  onMarkServed,
  onMarkNoShow,
  onMove,
  queueNames,
  locations,
  initialShowMoveOptions = false,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [targetQueue, setTargetQueue] = useState<string>(queueNames[0] ?? "");
  const [targetLocation, setTargetLocation] = useState<string>(locations[0]?.id ?? "");
  const [showMoveOptions, setShowMoveOptions] = useState(false);

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      const timeoutId = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeoutId);
    } else {
      previouslyFocusedRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setTargetQueue(queueNames[0] ?? "");
      setTargetLocation(entry?.locationId ?? locations[0]?.id ?? "");
      setShowMoveOptions(initialShowMoveOptions);
    }
  }, [open, queueNames, locations, entry?.id, entry?.locationId, initialShowMoveOptions]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMove = () => {
    if (onMove && entry && targetQueue && targetLocation) {
      onMove(entry, targetQueue, targetLocation);
      setShowMoveOptions(false);
    }
  };

  const queueOptions = queueNames.map((q) => ({ value: q, label: q }));
  const locationOptions = locations.map((loc) => ({ value: loc.id, label: loc.name }));

  return (
    <>
      <div
        className={styles.overlay}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={styles.panel}
      >
        <LoadingErrorState
          loading={open && entry === null}
          error={null}
          onRetry={() => {}}
          loadingMessage="Loading customer details..."
        >
          {entry && (
            <>
              <header className={styles.header}>
                <div className={styles.headerContent}>
                  <h2 id="drawer-title" className={styles.title}>
                    {entry.customer.firstName} {entry.customer.lastName}
                  </h2>
                  <div className={styles.subtitle}>
                    <Badge variant={getStatusBadgeVariant(entry.status)}>
                      {formatStatus(entry.status)}
                    </Badge>
                    <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>
                      Queue: {entry.queueName}
                    </span>
                  </div>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Close drawer"
                  onClick={onClose}
                  className={styles.closeButton}
                >
                  ×
                </button>
              </header>

              <div className={styles.body}>
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Operational Summary</h3>
                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Check-in Time</span>
                      <span className={styles.summaryValue}>{formatCheckInTime(entry.checkInTime)}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Wait Time</span>
                      <span className={styles.summaryValue}>{formatWaitTime(entry.waitTimeSeconds)}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Visit Type</span>
                      <span className={styles.summaryValue}>{entry.visitType}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Priority</span>
                      <span className={styles.summaryValue}>
                        <Badge variant={entry.priority}>
                          {entry.priority.charAt(0).toUpperCase() + entry.priority.slice(1)}
                        </Badge>
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Queue</span>
                      <span className={styles.summaryValue}>{entry.queueName}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Position</span>
                      <span className={styles.summaryValue}>#{entry.position}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Referring Doctor</span>
                      <span className={styles.summaryValue}>
                        {entry.referringDoctor || <span className={styles.emptyText}>None</span>}
                      </span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Insurance</span>
                      <span className={styles.summaryValue}>
                        {entry.insuranceProvider || <span className={styles.emptyText}>None</span>}
                      </span>
                    </div>
                    <div className={styles.summaryItem} style={{ gridColumn: "1 / -1" }}>
                      <span className={styles.summaryLabel}>Appointment ID</span>
                      <span className={styles.summaryValue}>
                        {entry.appointmentId || <span className={styles.emptyText}>Walk-in (no appointment)</span>}
                      </span>
                    </div>
                  </div>
                </section>

                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>Customer Details</h3>
                  <dl className={styles.definitionList}>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>Customer ID</dt>
                      <dd className={styles.definitionDesc}>{entry.customer.id}</dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>First Name</dt>
                      <dd className={styles.definitionDesc}>{entry.customer.firstName}</dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>Last Name</dt>
                      <dd className={styles.definitionDesc}>{entry.customer.lastName}</dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>Date of Birth</dt>
                      <dd className={styles.definitionDesc}>{formatDateOfBirth(entry.customer.dateOfBirth)}</dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>Gender</dt>
                      <dd className={styles.definitionDesc}>
                        {entry.customer.gender || <span className={styles.emptyText}>None recorded</span>}
                      </dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>Phone Number</dt>
                      <dd className={styles.definitionDesc}>
                        {entry.customer.phoneNumber || <span className={styles.emptyText}>None recorded</span>}
                      </dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>Email</dt>
                      <dd className={styles.definitionDesc}>
                        {entry.customer.email || <span className={styles.emptyText}>None recorded</span>}
                      </dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>Address Line 1</dt>
                      <dd className={styles.definitionDesc}>
                        {entry.customer.addressLine1 || <span className={styles.emptyText}>None recorded</span>}
                      </dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>City</dt>
                      <dd className={styles.definitionDesc}>
                        {entry.customer.city || <span className={styles.emptyText}>None recorded</span>}
                      </dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>ZIP Code</dt>
                      <dd className={styles.definitionDesc}>
                        {entry.customer.zipCode || <span className={styles.emptyText}>None recorded</span>}
                      </dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>Medicare Number</dt>
                      <dd className={styles.definitionDesc}>
                        {entry.customer.medicareNumber || <span className={styles.emptyText}>None recorded</span>}
                      </dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>Allergies</dt>
                      <dd className={styles.definitionDesc}>
                        {entry.customer.allergies && entry.customer.allergies.length > 0 ? (
                          <div className={styles.listContainer}>
                            {entry.customer.allergies.map((allergy, idx) => (
                              <div key={idx} className={styles.listItem}>{allergy}</div>
                            ))}
                          </div>
                        ) : (
                          <span className={styles.emptyText}>None recorded</span>
                        )}
                      </dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>Current Medications</dt>
                      <dd className={styles.definitionDesc}>
                        {entry.customer.currentMedications && entry.customer.currentMedications.length > 0 ? (
                          <div className={styles.listContainer}>
                            {entry.customer.currentMedications.map((med, idx) => (
                              <div key={idx} className={styles.listItem}>{med}</div>
                            ))}
                          </div>
                        ) : (
                          <span className={styles.emptyText}>None recorded</span>
                        )}
                      </dd>
                    </div>
                    <div className={styles.definitionRow}>
                      <dt className={styles.definitionTerm}>Notes</dt>
                      <dd className={styles.definitionDesc}>
                        {entry.customer.notes ? (
                          <span style={{ whiteSpace: "pre-wrap" }}>{entry.customer.notes}</span>
                        ) : (
                          <span className={styles.emptyText}>None recorded</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>
              </div>

              <footer className={styles.footer}>
                <div className={styles.actionRow}>
                  {entry.status === "waiting" && onCallNext && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onCallNext(entry)}
                      aria-label={`Call next: ${entry.customer.firstName} ${entry.customer.lastName}`}
                    >
                      Call Next
                    </Button>
                  )}
                  {entry.status === "called" && onMarkServed && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onMarkServed(entry)}
                      aria-label={`Mark ${entry.customer.firstName} ${entry.customer.lastName} as served`}
                    >
                      Mark Served
                    </Button>
                  )}
                  {(entry.status === "waiting" || entry.status === "called") && onMarkNoShow && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onMarkNoShow(entry)}
                      aria-label={`Mark ${entry.customer.firstName} ${entry.customer.lastName} as no-show`}
                    >
                      Mark No-Show
                    </Button>
                  )}
                  {onMove && (
                    <div className={styles.moveSection}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMoveOptions(!showMoveOptions)}
                        aria-label={`Toggle move options for ${entry.customer.firstName} ${entry.customer.lastName}`}
                        aria-expanded={showMoveOptions}
                      >
                        Move
                      </Button>
                      {showMoveOptions && (
                        <div className={styles.moveOptions}>
                          <Select
                            id="target-queue-select"
                            ariaLabel="Select target queue"
                            options={queueOptions}
                            value={targetQueue}
                            onChange={setTargetQueue}
                          />
                          <Select
                            id="target-location-select"
                            ariaLabel="Select target location"
                            options={locationOptions}
                            value={targetLocation}
                            onChange={setTargetLocation}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleMove}
                            disabled={!targetQueue || !targetLocation}
                            aria-label={`Confirm move ${entry.customer.firstName} ${entry.customer.lastName}`}
                          >
                            Confirm Move
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </footer>
            </>
          )}
        </LoadingErrorState>
      </div>
    </>
  );
};

export default CustomerDrawer;
