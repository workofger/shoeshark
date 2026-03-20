'use client';

import { getSupabase } from './supabase';
import { SyncQueueItem } from '../types';

const SYNC_KEY = 'shoeshark_sync_queue';
const SYNC_INTERVAL = 30_000; // 30 seconds

let syncTimer: ReturnType<typeof setInterval> | null = null;

function getQueue(): SyncQueueItem[] {
  try {
    const data = localStorage.getItem(SYNC_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: SyncQueueItem[]): void {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(queue));
  } catch {
    // Storage full
  }
}

export function enqueueSync(item: Omit<SyncQueueItem, 'retries'>): void {
  const queue = getQueue();
  queue.push({ ...item, retries: 0 });
  saveQueue(queue);
}

async function processQueue(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  if (!navigator.onLine) return;

  const queue = getQueue();
  if (queue.length === 0) return;

  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'hand') {
        const { error } = await supabase.from('hands').upsert(item.data);
        if (error) throw error;
      } else if (item.type === 'session') {
        const { error } = await supabase.from('sessions').upsert(item.data);
        if (error) throw error;
      }
    } catch (err) {
      if (item.retries < 3) {
        remaining.push({ ...item, retries: item.retries + 1 });
      }
      // Drop after 3 retries
    }
  }

  saveQueue(remaining);
}

export function startSync(): void {
  if (syncTimer) return;

  // Process immediately
  processQueue();

  // Then every 30s
  syncTimer = setInterval(processQueue, SYNC_INTERVAL);

  // Also sync on reconnect
  if (typeof window !== 'undefined') {
    window.addEventListener('online', processQueue);
  }
}

export function stopSync(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
  if (typeof window !== 'undefined') {
    window.removeEventListener('online', processQueue);
  }
}

export function getSyncQueueSize(): number {
  return getQueue().length;
}
