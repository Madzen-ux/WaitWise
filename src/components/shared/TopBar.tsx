'use client';

import { useAuth } from '@/context/AuthContext';
import { useQueue } from '@/context/QueueContext';
import { LogOut, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TopBar() {
  const { staff, logout } = useAuth();
  const { business, queue, getWaitingCount, getCompletedCount } = useQueue();
  const waitingCount = getWaitingCount();
  const completedCount = getCompletedCount();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{business.name}</h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-gray-700">Waiting: {waitingCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-700">Completed: {completedCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{staff?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
