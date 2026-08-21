'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useQueue } from '@/context/QueueContext';

function PatientCheckForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || 'city-clinic';
  const { getTokenByNumber, business } = useQueue();

  const [tokenNumber, setTokenNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const num = parseInt(tokenNumber, 10);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid token number');
      return;
    }

    const token = getTokenByNumber(num);
    if (!token) {
      setError('Token not found — please check with reception');
      return;
    }

    router.push(`/patient/token/${token.id}?slug=${encodeURIComponent(slug)}`);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{business.name}</CardTitle>
        <p className="text-sm text-gray-500">Enter your token number to check your status</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="tokenNumber">Token Number</Label>
            <Input
              id="tokenNumber"
              type="number"
              value={tokenNumber}
              onChange={(e) => setTokenNumber(e.target.value)}
              placeholder="e.g. 5"
              className="text-center text-2xl h-14"
              required
            />
          </div>
          <Button type="submit" className="w-full" size="lg">
            Check Status
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function PatientCheckPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
        <PatientCheckForm />
      </Suspense>
    </div>
  );
}
