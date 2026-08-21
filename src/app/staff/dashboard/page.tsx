'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQueue } from '@/context/QueueContext';
import { DailyQueue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  Phone,
  SkipForward,
  RotateCcw,
  X,
  CheckCircle,
  Pause,
  Play,
  ClipboardX,
  QrCode,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  WAITING: 'bg-gray-100 text-gray-800',
  IN_CONSULT: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  SKIPPED: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function StaffDashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    queue,
    setQueue,
    addToken,
    callNext,
    markComplete,
    skipToken,
    recallToken,
    cancelToken,
    pauseQueue,
    resumeQueue,
    closeQueue,
    getCurrentToken,
  } = useQueue();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [undoStack, setUndoStack] = useState<DailyQueue[]>([]);
  const [undoTokenId, setUndoTokenId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const waitingTokens = queue.tokens.filter(t => t.status === 'WAITING');
  const activeTokens = queue.tokens.filter(t => t.status === 'IN_CONSULT');
  const waitingCount = waitingTokens.length;
  const canCallNext = !queue.queuePaused && waitingCount > 0 && !queue.isClosed;

  const handleAddPatient = () => {
    if (!patientName.trim()) return;
    addToken(patientName.trim(), isEmergency);
    setPatientName('');
    setIsEmergency(false);
    setIsAddDialogOpen(false);
  };

  const handleCallNext = () => {
    const prevQueue: DailyQueue = { ...queue, tokens: [...queue.tokens] };
    const result = callNext();
    if (result.nextToken) {
      setUndoStack([prevQueue, ...undoStack].slice(0, 5));
      setUndoTokenId(result.nextToken.id);
      setTimeout(() => {
        setUndoStack(prev => {
          const filtered = prev.filter(q => q.currentTokenId !== prevQueue.currentTokenId);
          if (filtered.length === prev.length) {
            setUndoTokenId(null);
          }
          return filtered;
        });
      }, 5000);
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0 && undoTokenId) {
      const prev = undoStack[0];
      setQueue(prev);
      setUndoStack(prev => prev.slice(1));
      setUndoTokenId(null);
    }
  };

  const handleCloseQueue = () => {
    closeQueue();
    setIsCloseDialogOpen(false);
  };

  const handleRecall = (tokenId: string) => {
    recallToken(tokenId);
  };

  const handleEdit = (tokenId: string, currentName: string) => {
    const newName = prompt('Edit patient name:', currentName);
    if (newName && newName.trim()) {
      const updatedTokens = queue.tokens.map(t =>
        t.id === tokenId ? { ...t, patientName: newName!.trim() } : t
      );
      setQueue({ ...queue, tokens: updatedTokens });
    }
  };

  const currentToken = getCurrentToken();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {!queue.queuePaused ? (
            <Button onClick={handleCallNext} disabled={!canCallNext} size="lg">
              <Phone className="h-4 w-4 mr-2" />
              Call Next
            </Button>
          ) : (
            <Button onClick={resumeQueue} size="lg" variant="secondary">
              <Play className="h-4 w-4 mr-2" />
              Resume Queue
            </Button>
          )}

          {queue.queuePaused && (
            <Button onClick={resumeQueue} variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}

          {!queue.queuePaused && !queue.isClosed && (
            <Button onClick={pauseQueue} variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-2" />
              Pause Queue
            </Button>
          )}

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger>
              <Button variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patientName">Patient Name</Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPatient()}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="emergency"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="emergency" className="text-sm font-medium">
                    Mark as emergency (jump to front of queue)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddPatient} disabled={!patientName.trim()}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
            <DialogTrigger>
              <Button variant="destructive" size="sm">
                <ClipboardX className="h-4 w-4 mr-2" />
                Close Today&apos;s Queue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Close Today&apos;s Queue?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600">
                {waitingCount > 0 || activeTokens.length > 0 ? (
                  <>
                    <span className="font-semibold text-red-600">{waitingCount + activeTokens.length}</span> patients are still waiting.
                    Are you sure you want to close today&apos;s queue?
                  </>
                ) : (
                  'Are you sure you want to close today&apos;s queue?'
                )}
              </p>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCloseDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleCloseQueue}>Close Anyway</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-3">
          {undoStack.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleUndo}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Undo Next
            </Button>
          )}
          <Button variant="outline" size="sm">
            <QrCode className="h-4 w-4 mr-2" />
            Show QR
          </Button>
        </div>
      </div>

      {queue.queuePaused && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="py-3">
            <p className="text-sm text-orange-800 font-medium">Queue Paused — Doctor is delayed</p>
          </CardContent>
        </Card>
      )}

      {queue.isClosed && (
        <Card className="mb-6 border-gray-200 bg-gray-50">
          <CardContent className="py-3">
            <p className="text-sm text-gray-600 font-medium">Today&apos;s queue is closed.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {queue.tokens.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No patients in queue today. Add the first patient to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Token</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Patient</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.tokens
                    .sort((a, b) => a.tokenNumber - b.tokenNumber)
                    .map((token) => (
                      <tr key={token.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono font-medium">#{token.tokenNumber}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {token.patientName}
                            {token.isEmergency && (
                              <Badge variant="destructive" className="text-xs">Emergency</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[token.status]}>{token.status.replace('_', ' ')}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {token.status === 'WAITING' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(token.id, token.patientName)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => skipToken(token.id)}
                                >
                                  <SkipForward className="h-4 w-4 mr-1" />
                                  Skip
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => cancelToken(token.id)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}
                            {token.status === 'IN_CONSULT' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markComplete(token.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Complete
                              </Button>
                            )}
                            {token.status === 'SKIPPED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRecall(token.id)}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Recall
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
