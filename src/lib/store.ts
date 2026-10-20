import { dayKey, monthKey } from './dates';
import { freshPlanFields } from './plan';
import type { State } from './types';

const DB_NAME = 'papa-gym';
const STORE = 'kv';
const KEY = 'state';

export function newState(now: Date = new Date()): State {
  return {
    v: 1,
    profile: {
      startDate: dayKey(now),
      points: 0,
      tickets: 2,
      ticketMonth: monthKey(now),
      amounts: {},
      ...freshPlanFields(dayKey(now)),
    },
    children: [],
    cheers: [],
    days: {},
    logs: [],
    checks: [],
    cards: {},
    familyRewards: [],
    selfRewards: [],
    missionDone: {},
  };
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadState(): Promise<State | undefined> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result as State | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function saveState(state: State): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(state, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function exportJson(state: State): string {
  return JSON.stringify(state, null, 2);
}

/** Throws if the text is not a papa-gym backup. */
export function parseBackup(text: string): State {
  const data = JSON.parse(text) as Partial<State>;
  if (data.v !== 1 || !data.profile || !data.days) throw new Error('papa-gym のバックアップではありません');
  return { ...newState(), ...data } as State;
}
