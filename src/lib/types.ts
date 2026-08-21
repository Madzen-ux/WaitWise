export interface Business {
  id: string;
  name: string;
  slug: string;
  settings: {
    avgConsultationTime: number;
  };
}

export interface ServiceProvider {
  id: string;
  name: string;
  businessId: string;
}

export interface Token {
  id: string;
  tokenNumber: number;
  patientName: string;
  status: 'WAITING' | 'IN_CONSULT' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';
  isEmergency: boolean;
  serviceProviderId: string;
  dailyQueueId: string;
  createdAt: string;
  calledAt: string | null;
  completedAt: string | null;
}

export interface DailyQueue {
  id: string;
  businessId: string;
  date: string;
  isClosed: boolean;
  currentTokenId: string | null;
  queuePaused: boolean;
  tokens: Token[];
}

export interface Staff {
  id: string;
  name: string;
  pin: string;
  role: 'STAFF';
}
