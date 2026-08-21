'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

export default function QRPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || 'city-clinic';

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/patient/check?slug=${encodeURIComponent(slug)}`);
    }, 1500);
    return () => clearTimeout(timer);
  }, [router, slug]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">City Clinic</h1>
          <p className="text-gray-600 mb-6">Enter your token number below to check your status</p>
          <p className="text-sm text-gray-400">Redirecting to check-in...</p>
          <div className="mt-4">
            <button
              onClick={() => router.push(`/patient/check?slug=${encodeURIComponent(slug)}`)}
              className="text-blue-600 hover:underline text-sm"
            >
              Click here if you are not redirected
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
