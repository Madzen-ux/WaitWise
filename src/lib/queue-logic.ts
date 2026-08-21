import { DailyQueue, Token } from '@/lib/types';

export function getNextTokenNumber(queue: DailyQueue): number {
  if (queue.tokens.length === 0) return 1;
  return Math.max(...queue.tokens.map(t => t.tokenNumber)) + 1;
}

export function callNext(queue: DailyQueue): { queue: DailyQueue; nextToken: Token | null } {
  if (queue.queuePaused) {
    return { queue, nextToken: null };
  }

  const waitingTokens = queue.tokens
    .filter(t => t.status === 'WAITING')
    .sort((a, b) => (b.isEmergency ? 1 : 0) - (a.isEmergency ? 1 : 0) || a.tokenNumber - b.tokenNumber);

  if (waitingTokens.length === 0) {
    return { queue, nextToken: null };
  }

  const next = waitingTokens[0];
  const updatedTokens = queue.tokens.map(t =>
    t.id === next.id
      ? { ...t, status: 'IN_CONSULT' as const, calledAt: new Date().toISOString() }
      : t
  );

  const updatedQueue: DailyQueue = {
    ...queue,
    currentTokenId: next.id,
    tokens: updatedTokens,
  };

  return { queue: updatedQueue, nextToken: next };
}

export function markComplete(queue: DailyQueue, tokenId: string): DailyQueue {
  const updatedTokens = queue.tokens.map(t =>
    t.id === tokenId
      ? { ...t, status: 'COMPLETED' as const, completedAt: new Date().toISOString() }
      : t
  );

  const updatedQueue: DailyQueue = {
    ...queue,
    currentTokenId: queue.currentTokenId === tokenId ? null : queue.currentTokenId,
    tokens: updatedTokens,
  };

  return updatedQueue;
}

export function skipToken(queue: DailyQueue, tokenId: string): DailyQueue {
  const updatedTokens = queue.tokens.map(t =>
    t.id === tokenId ? { ...t, status: 'SKIPPED' as const } : t
  );

  const updatedQueue: DailyQueue = {
    ...queue,
    tokens: updatedTokens,
  };

  if (queue.currentTokenId === tokenId) {
    return callNext(updatedQueue).queue;
  }

  return updatedQueue;
}

export function recallToken(queue: DailyQueue, tokenId: string): DailyQueue {
  const updatedTokens = queue.tokens.map(t =>
    t.id === tokenId ? { ...t, status: 'WAITING' as const } : t
  );

  return {
    ...queue,
    tokens: updatedTokens,
  };
}

export function cancelToken(queue: DailyQueue, tokenId: string): DailyQueue {
  const updatedTokens = queue.tokens.filter(t => t.id !== tokenId);
  return {
    ...queue,
    currentTokenId: queue.currentTokenId === tokenId ? null : queue.currentTokenId,
    tokens: updatedTokens,
  };
}

export function getEstimatedWait(queue: DailyQueue, tokenNumber: number, avgConsultationTime: number): number | null {
  if (queue.queuePaused) return null;

  const current = queue.currentTokenId
    ? queue.tokens.find(t => t.id === queue.currentTokenId)
    : null;

  const currentTokenNumber = current?.tokenNumber || 0;

  const peopleAhead = queue.tokens.filter(t => {
    if (t.status !== 'WAITING' && t.status !== 'IN_CONSULT') return false;
    if (t.tokenNumber <= currentTokenNumber) return false;
    if (t.tokenNumber >= tokenNumber) return false;
    return true;
  }).length;

  return peopleAhead * avgConsultationTime;
}

export function getCurrentToken(queue: DailyQueue): Token | null {
  if (!queue.currentTokenId) return null;
  return queue.tokens.find(t => t.id === queue.currentTokenId) || null;
}

export function getWaitingCount(queue: DailyQueue): number {
  return queue.tokens.filter(t => t.status === 'WAITING').length;
}

export function getCompletedCount(queue: DailyQueue): number {
  return queue.tokens.filter(t => t.status === 'COMPLETED').length;
}

export function getTokenById(queue: DailyQueue, tokenId: string): Token | undefined {
  return queue.tokens.find(t => t.id === tokenId);
}

export function getTokenByNumber(queue: DailyQueue, tokenNumber: number): Token | undefined {
  return queue.tokens.find(t => t.tokenNumber === tokenNumber);
}
