'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SessionRecord } from '../../../types';

export default function SessionDetailPage() {
  const params = useParams();
  const [session, setSession] = useState<SessionRecord | null>(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem('shoeshark_sessions');
      if (data) {
        const sessions = JSON.parse(data) as SessionRecord[];
        const found = sessions.find((s) => s.id === params.id);
        if (found) setSession(found);
      }
    } catch {}
  }, [params.id]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Session not found</p>
      </div>
    );
  }

  const duration = session.endTime
    ? Math.round((session.endTime - session.startTime) / 60000)
    : null;

  const results = session.hands.reduce(
    (acc, h) => { acc[h.result.result]++; return acc; },
    { player: 0, banker: 0, tie: 0 } as Record<string, number>
  );

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-4 border-b border-[#1A1A25]">
        <Link href="/history">
          <span className="text-sm text-gray-400">← Back</span>
        </Link>
        <span className="text-sm text-gray-400">Session Detail</span>
      </header>

      <main className="p-4 space-y-4">
        {/* Stats */}
        <div className="bg-[#13131A] rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">
            {new Date(session.startTime).toLocaleString()}
          </div>
          <div className="grid grid-cols-4 gap-3 mt-3">
            <StatBox label="Hands" value={session.hands.length} />
            <StatBox label="Player" value={results.player} color="#4FC3F7" />
            <StatBox label="Banker" value={results.banker} color="#EF5350" />
            <StatBox label="Tie" value={results.tie} color="#66BB6A" />
          </div>
          {duration !== null && (
            <div className="text-xs text-gray-600 mt-2">Duration: {duration} minutes</div>
          )}
        </div>

        {/* Hands list */}
        <div className="space-y-2">
          <h3 className="text-sm text-gray-400">Hands</h3>
          {session.hands.map((hand) => (
            <div key={hand.id} className="bg-[#13131A] rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 font-mono w-6">#{hand.handNumber}</span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    hand.result.result === 'player'
                      ? 'bg-[#4FC3F7]/20 text-[#4FC3F7]'
                      : hand.result.result === 'banker'
                      ? 'bg-[#EF5350]/20 text-[#EF5350]'
                      : 'bg-[#66BB6A]/20 text-[#66BB6A]'
                  }`}
                >
                  {hand.result.result[0].toUpperCase()}
                </div>
              </div>
              <div className="text-xs font-mono text-gray-500">
                P:{hand.result.playerTotal} B:{hand.result.bankerTotal}
                {hand.result.isNatural && ' 🎯'}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold font-mono" style={{ color: color || 'white' }}>
        {value}
      </div>
      <div className="text-[10px] text-gray-500">{label}</div>
    </div>
  );
}
