import { AuthProvider } from '@/context/AuthContext';
import { QueueProvider } from '@/context/QueueContext';
import TopBar from '@/components/shared/TopBar';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueueProvider>
        <div className="min-h-screen bg-gray-50">
          <TopBar />
          <main className="p-6">
            {children}
          </main>
        </div>
      </QueueProvider>
    </AuthProvider>
  );
}
