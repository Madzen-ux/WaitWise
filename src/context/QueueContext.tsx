'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { DailyQueue, Token, Business, ServiceProvider } from '@/lib/types';
import { mockBusiness, mockProvider, createInitialQueue, seedDemoTokens } from '@/lib/mock-data';
import { getNextTokenNumber, callNext as callNextLogic, markComplete as markCompleteLogic, skipToken as skipTokenLogic, recallToken as recallTokenLogic, cancelToken as cancelTokenLogic, getEstimatedWait, getCurrentToken, getWaitingCount, getCompletedCount, getTokenById, getTokenByNumber } from '@/lib/queue-logic';

interface QueueContextType {
  business: Business;
  provider: ServiceProvider;
  queue: DailyQueue;
  setQueue: React.Dispatch<React.SetStateAction<DailyQueue>>;
  addToken: (patientName: string, isEmergency?: boolean) => Token;
  callNext: () => { queue: DailyQueue; nextToken: Token | null };
  markComplete: (tokenId: string) => DailyQueue;
  skipToken: (tokenId: string) => DailyQueue;
  recallToken: (tokenId: string) => DailyQueue;
  cancelToken: (tokenId: string) => DailyQueue;
  pauseQueue: () => void;
  resumeQueue: () => void;
  closeQueue: () => DailyQueue;
  getEstimatedWait: (tokenNumber: number) => number | null;
  getCurrentToken: () => Token | null;
  getWaitingCount: () => number;
  getCompletedCount: () => number;
  getTokenById: (tokenId: string) => Token | undefined;
  getTokenByNumber: (tokenNumber: number) => Token | undefined;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<DailyQueue>(() => {
    const initial = createInitialQueue();
    initial.tokens = seedDemoTokens();
    return initial;
  });

  const addToken = (patientName: string, isEmergency = false): Token => {
    const tokenNumber = getNextTokenNumber(queue);
    const newToken: Token = {
      id: 'tok-' + Date.now(),
      tokenNumber,
      patientName,
      status: 'WAITING',
      isEmergency,
      serviceProviderId: mockProvider.id,
      dailyQueueId: queue.id,
      createdAt: new Date().toISOString(),
      calledAt: null,
      completedAt: null,
    };

    setQueue(prev => ({
      ...prev,
      tokens: [...prev.tokens, newToken],
    }));

    return newToken;
  };

  const callNextAction = () => {
    const result = callNextLogic(queue);
    setQueue(result.queue);
    return result;
  };

  const markCompleteAction = (tokenId: string) => {
    const updated = markCompleteLogic(queue, tokenId);
    setQueue(updated);
    return updated;
  };

  const skipTokenAction = (tokenId: string) => {
    const updated = skipTokenLogic(queue, tokenId);
    setQueue(updated);
    return updated;
  };

  const recallTokenAction = (tokenId: string) => {
    const updated = recallTokenLogic(queue, tokenId);
    setQueue(updated);
    return updated;
  };

  const cancelTokenAction = (tokenId: string) => {
    const updated = cancelTokenLogic(queue, tokenId);
    setQueue(updated);
    return updated;
  };

  const pauseQueue = () => {
    setQueue(prev => ({ ...prev, queuePaused: true }));
  };

  const resumeQueue = () => {
    setQueue(prev => ({ ...prev, queuePaused: false }));
  };

  const closeQueue = () => {
    setQueue(prev => ({ ...prev, isClosed: true, closedAt: new Date().toISOString() }));
    return queue;
  };

  return (
    <QueueContext.Provider
      value={{
        business: mockBusiness,
        provider: mockProvider,
        queue,
        setQueue,
        addToken,
        callNext: callNextAction,
        markComplete: markCompleteAction,
        skipToken: skipTokenAction,
        recallToken: recallTokenAction,
        cancelToken: cancelTokenAction,
        pauseQueue,
        resumeQueue,
        closeQueue,
        getEstimatedWait: (n: number) => getEstimatedWait(queue, n, mockBusiness.settings.avgConsultationTime),
        getCurrentToken: () => getCurrentToken(queue),
        getWaitingCount: () => getWaitingCount(queue),
        getCompletedCount: () => getCompletedCount(queue),
        getTokenById: (id: string) => getTokenById(queue, id),
        getTokenByNumber: (n: number) => getTokenByNumber(queue, n),
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
