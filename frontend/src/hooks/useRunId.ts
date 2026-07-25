// Lightweight global run-id store (no Redux needed)
let _runId: string | null = null;
const _listeners = new Set<(id: string | null) => void>();

export function getRunId() { return _runId; }

export function setRunId(id: string | null) {
  _runId = id;
  _listeners.forEach(fn => fn(id));
}

export function subscribeRunId(fn: (id: string | null) => void) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

import { useState, useEffect } from 'react';
export function useRunId(): [string | null, (id: string | null) => void] {
  const [id, setId] = useState<string | null>(_runId);
  useEffect(() => {
    const unsub = subscribeRunId(setId);
    return () => { unsub(); };
  }, []);
  return [id, setRunId];
}
