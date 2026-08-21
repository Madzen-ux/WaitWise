'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { useQueue } from '@/context/QueueContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, HelpCircle } from 'lucide-react';

function PatientTokenContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tokenId = params.id as string;
  const { getTokenById, getCurrentToken, getEstimatedWait, queue } = useQueue();

  const [token, setToken] = useState(() => getTokenById(tokenId));
  const [currentToken, setCurrentToken] = useState(() => getCurrentToken());
  const [estimatedWait, setEstimatedWait] = useState(() => token ? getEstimatedWait(token.tokenNumber) : null);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTokenById(tokenId);
      const ct = getCurrentToken();
      setToken(t);
      setCurrentToken(ct);
      if (t) {
        setEstimatedWait(getEstimatedWait(t.tokenNumber));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [tokenId, getTokenById, getCurrentToken, getEstimatedWait]);

  if (!token) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Link</h2>
          <p className="text-gray-600">This link is invalid. Please scan the QR code at reception.</p>
        </CardContent>
      </Card>
    );
  }

  const peopleAhead = token && currentToken
    ? queue.tokens.filter(t => {
        if (t.status !== 'WAITING' && t.status !== 'IN_CONSULT') return false;
        if (t.tokenNumber <= currentToken.tokenNumber) return false;
        if (t.tokenNumber >= token.tokenNumber) return false;
        return true;
      }).length
    : 0;

  const queueStatus = queue.queuePaused ? 'Paused' : 'Moving normally';

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Hello, {token.patientName}</CardTitle>
        <p className="text-gray-500">Your Token: #{token.tokenNumber}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-500">Current Token</span>
          <span className="text-2xl font-bold text-gray-900">
            {currentToken ? `#${currentToken.tokenNumber}` : '--'}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-500">People Ahead</span>
          <span className="text-2xl font-bold text-gray-900">{peopleAhead}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-500">Estimated Wait</span>
          <span className="text-2xl font-bold text-gray-900">
            {estimatedWait !== null ? `${estimatedWait} min` : '--'}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-500">Queue Status</span>
          <Badge variant={queueStatus === 'Paused' ? 'destructive' : 'default'}>
            {queueStatus}
          </Badge>
        </div>

        <div className="flex items-center gap-2 pt-4">
          <div className="flex items-center gap-1 text-green-600">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium">Live</span>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              const t = getTokenById(tokenId);
              const ct = getCurrentToken();
              setToken(t);
              setCurrentToken(ct);
              if (t) setEstimatedWait(getEstimatedWait(t.tokenNumber));
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => alert('Ask reception for assistance')}>
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PatientTokenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
          <PatientTokenContent />
        </Suspense>
      </div>
    </div>
  );
}
