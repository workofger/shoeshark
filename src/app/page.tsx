'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SessionRecord } from '../types';

export default function HomePage() {
  const [recentSessions, setRecentSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem('shoeshark_sessions');
      if (data) {
        const sessions = JSON.parse(data) as SessionRecord[];
        setRecentSessions(sessions.slice(-3).reverse());
      }
    } catch {}
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-2">
          🦈 <span className="text-white">Shoe</span>
          <span className="text-[#4FC3F7]">Shark</span>
        </h1>
        <p className="text-gray-500 text-sm">Real-time baccarat EV engine</p>
      </div>

      {/* Main action */}
      <Link href="/play">
        <button className="bg-[#4FC3F7] text-black font-bold text-lg px-12 py-4 rounded-xl hover:bg-[#3DA8D8] active:scale-95 transition-all min-h-[56px]">
          New Shoe
        </button>
      </Link>

      {/* Secondary actions */}
      <div className="flex gap-4 mt-6">
        <Link href="/history">
          <button className="bg-[#1A1A25] text-gray-400 px-6 py-3 rounded-xl hover:bg-[#252535] transition-colors min-h-[48px]">
            History
          </button>
        </Link>
        <Link href="/settings">
          <button className="bg-[#1A1A25] text-gray-400 px-6 py-3 rounded-xl hover:bg-[#252535] transition-colors min-h-[48px]">
            Settings
          </button>
        </Link>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div className="mt-12 w-full max-w-md">
          <h3 className="text-sm text-gray-500 mb-3">Recent Sessions</h3>
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <Link key={s.id} href={`/session/${s.id}`}>
                <div className="bg-[#13131A] rounded-lg p-3 hover:bg-[#1A1A25] transition-colors">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      {new Date(s.startTime).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500 font-mono">
                      {s.hands.length} hands
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Version */}
      <p className="text-gray-800 text-xs mt-12">v1.0.0 — Offline-first PWA</p>
    </div>
  );
}
