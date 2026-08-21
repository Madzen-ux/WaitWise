import { Business, ServiceProvider, Staff, DailyQueue, Token } from '@/lib/types';

export const mockBusiness: Business = {
  id: 'biz-1',
  name: 'City Clinic',
  slug: 'city-clinic',
  settings: { avgConsultationTime: 8 },
};

export const mockProvider: ServiceProvider = {
  id: 'sp-1',
  name: 'Dr. Sharma',
  businessId: 'biz-1',
};

export const mockStaff: Staff = {
  id: 'staff-1',
  name: 'Receptionist',
  pin: '1234',
  role: 'STAFF',
};

export const createInitialQueue = (): DailyQueue => ({
  id: 'dq-' + new Date().toISOString().split('T')[0],
  businessId: 'biz-1',
  date: new Date().toISOString().split('T')[0],
  isClosed: false,
  currentTokenId: null,
  queuePaused: false,
  tokens: [],
});

export const seedDemoTokens = (): Token[] => {
  const today = new Date().toISOString().split('T')[0];
  const queueId = 'dq-' + today;
  const baseTime = new Date();
  return [
    {
      id: 'tok-1',
      tokenNumber: 1,
      patientName: 'Rahul',
      status: 'COMPLETED',
      isEmergency: false,
      serviceProviderId: 'sp-1',
      dailyQueueId: queueId,
      createdAt: new Date(baseTime.getTime() - 60 * 60 * 1000).toISOString(),
      calledAt: new Date(baseTime.getTime() - 55 * 60 * 1000).toISOString(),
      completedAt: new Date(baseTime.getTime() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'tok-2',
      tokenNumber: 2,
      patientName: 'Priya',
      status: 'COMPLETED',
      isEmergency: false,
      serviceProviderId: 'sp-1',
      dailyQueueId: queueId,
      createdAt: new Date(baseTime.getTime() - 50 * 60 * 1000).toISOString(),
      calledAt: new Date(baseTime.getTime() - 40 * 60 * 1000).toISOString(),
      completedAt: new Date(baseTime.getTime() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: 'tok-3',
      tokenNumber: 3,
      patientName: 'Aman',
      status: 'IN_CONSULT',
      isEmergency: false,
      serviceProviderId: 'sp-1',
      dailyQueueId: queueId,
      createdAt: new Date(baseTime.getTime() - 30 * 60 * 1000).toISOString(),
      calledAt: new Date(baseTime.getTime() - 20 * 60 * 1000).toISOString(),
      completedAt: null,
    },
    {
      id: 'tok-4',
      tokenNumber: 4,
      patientName: 'Sneha',
      status: 'WAITING',
      isEmergency: false,
      serviceProviderId: 'sp-1',
      dailyQueueId: queueId,
      createdAt: new Date(baseTime.getTime() - 15 * 60 * 1000).toISOString(),
      calledAt: null,
      completedAt: null,
    },
    {
      id: 'tok-5',
      tokenNumber: 5,
      patientName: 'Vikram',
      status: 'WAITING',
      isEmergency: false,
      serviceProviderId: 'sp-1',
      dailyQueueId: queueId,
      createdAt: new Date(baseTime.getTime() - 10 * 60 * 1000).toISOString(),
      calledAt: null,
      completedAt: null,
    },
    {
      id: 'tok-6',
      tokenNumber: 6,
      patientName: 'Emergency Patient',
      status: 'WAITING',
      isEmergency: true,
      serviceProviderId: 'sp-1',
      dailyQueueId: queueId,
      createdAt: new Date(baseTime.getTime() - 2 * 60 * 1000).toISOString(),
      calledAt: null,
      completedAt: null,
    },
  ];
};
