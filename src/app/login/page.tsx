'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [staffId, setStaffId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    router.push('/staff/dashboard');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(staffId, pin);
    if (success) {
      router.push('/staff/dashboard');
    } else {
      setError('Invalid Staff ID or PIN');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">WaitWise</CardTitle>
          <p className="text-sm text-gray-500">Staff Login</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="staffId">Staff ID</Label>
              <Input
                id="staffId"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="Enter your Staff ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          </form>
          <p className="text-xs text-center text-gray-400 mt-4">
            Demo: Staff ID: staff-1 | PIN: 1234
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
