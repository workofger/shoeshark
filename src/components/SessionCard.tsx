'use client';

import Link from 'next/link';
import { SessionRecord } from '../types';

export default function SessionCard({ session }: { session: SessionRecord }) {
  const duration = session.endTime
    ? Math.round((session.endTime - session.startTime) / 60000)
    : null;

  const results = session.hands.reduce(
    (acc, h) => {
      acc[h.result.result]++;
      return acc;
    },
    { player: 0, banker: 0, tie: 0 } as Record<string, number>
  );

  const date = new Date(session.startTime);

  return (
    <Link href={`/session/${session.id}`}>
      <div className="bg-[#13131A] rounded-xl p-4 hover:bg-[#1A1A25] transition-colors cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {duration !== null && (
            <span className="text-xs text-gray-500">{duration}m</span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-gray-400">{session.hands.length} hands</span>
          <span className="text-[#4FC3F7]">P:{results.player}</span>
          <span className="text-[#EF5350]">B:{results.banker}</span>
          <span className="text-[#66BB6A]">T:{results.tie}</span>
        </div>
      </div>
    </Link>
  );
}
