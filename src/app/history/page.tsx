'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SessionRecord } from '../../types';
import SessionCard from '../../components/SessionCard';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem('shoeshark_sessions');
      if (data) {
        const parsed = JSON.parse(data) as SessionRecord[];
        setSessions(parsed.reverse());
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-4 border-b border-[#1A1A25]">
        <Link href="/">
          <span className="text-lg font-bold">
            🦈 <span className="text-[#4FC3F7]">Shark</span>
          </span>
        </Link>
        <h2 className="text-sm text-gray-400">History</h2>
      </header>

      <main className="p-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No sessions yet</p>
            <Link href="/play">
              <button className="mt-4 bg-[#4FC3F7] text-black font-bold px-6 py-3 rounded-xl min-h-[48px]">
                Start Playing
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
