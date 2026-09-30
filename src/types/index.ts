export type QueueStatus = "waiting" | "called" | "served" | "no-show";

export type VisitType =
  | "General Consultation"
  | "Follow-up"
  | "Lab Work"
  | "Vaccination"
  | "Prescription Refill"
  | "Physical Exam";

export type Priority = "routine" | "urgent";

export interface Location {
  id: string;
  name: string;
  address: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  addressLine1: string;
  city: string;
  zipCode: string;
  medicareNumber: string;
  allergies: string[];
  currentMedications: string[];
  notes: string;
}

export interface QueueEntry {
  id: string;
  customerId: string;
  customer: Customer;
  locationId: string;
  queueName: string;
  position: number;
  status: QueueStatus;
  waitTimeSeconds: number;
  checkInTime: string;
  calledTime: string | null;
  servedTime: string | null;
  visitType: VisitType;
  priority: Priority;
  referringDoctor: string;
  insuranceProvider: string;
  appointmentId: string | null;
}

export interface QueueSummary {
  locationId: string;
  waitingCount: number;
  calledCount: number;
  servedCount: number;
  noShowCount: number;
  averageWaitTimeSeconds: number;
  longestWaitTimeSeconds: number;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  retryAction?: () => void;
  retryLabel?: string;
}

export type ActionType =
  | "callNext"
  | "markServed"
  | "markNoShow"
  | "moveQueue";
