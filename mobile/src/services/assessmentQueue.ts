import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persistent offline queue for assessments created without connectivity.
 *
 * Stored as a single JSON array under QUEUE_KEY (same AsyncStorage architecture
 * as session.ts). Entries survive app restarts, navigation and network loss.
 * Only lightweight metadata + a local FILE REFERENCE are stored here — binary
 * video data must live on disk (expo-file-system), never inside this JSON.
 */

const QUEUE_KEY = 'talentscope.offline.assessments.v1';

/** Mirrors backend Assessment.status enum conventions */
export type QueuedSyncStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed';

export interface QueuedAssessment {
  /** Stable locally-generated identifier (survives restarts) */
  localId: string;
  /** Idempotency key preventing duplicate submissions of the same logical assessment */
  idempotencyKey: string;
  /** Server assessment id once synchronization has created the remote record */
  serverId: string | null;
  /** Owning athlete (User._id) */
  athleteId: string;
  sport: string;
  testType: string;
  category?: string;
  notes?: string;
  /** Local file-system URI reference — NEVER raw video bytes */
  localVideoUri: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: QueuedSyncStatus;
  retryCount: number;
  lastSyncAttemptAt: string | null;
  error: string | null;
}

export interface QueuedAssessmentInput {
  athleteId: string;
  sport: string;
  testType: string;
  category?: string;
  notes?: string;
  localVideoUri?: string | null;
  /**
   * Pass the same key when retrying creation of the SAME logical assessment
   * (e.g. after a timeout where the request may have reached the server).
   * Omit for genuinely new assessments.
   */
  idempotencyKey?: string;
}

export type QueuedAssessmentPatch = Partial<
  Omit<QueuedAssessment, 'localId' | 'idempotencyKey' | 'createdAt'>
>;

export const makeLocalId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;

const readQueue = async (): Promise<QueuedAssessment[]> => {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[AssessmentQueue] read failed, starting empty:', e);
    return [];
  }
};

const writeQueue = async (queue: QueuedAssessment[]): Promise<void> => {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

/**
 * Adds an assessment to the queue.
 * Throws when an entry with the same idempotencyKey already exists
 * (prevents duplicate submissions of the same logical assessment).
 */
export const addQueuedAssessment = async (
  input: QueuedAssessmentInput
): Promise<QueuedAssessment> => {
  if (!input?.athleteId) throw new Error('athleteId is required');
  if (!input.sport) throw new Error('sport is required');
  if (!input.testType) throw new Error('testType is required');

  const queue = await readQueue();
  const idempotencyKey =
    input.idempotencyKey?.trim() ||
    `${input.athleteId}:${input.testType}:${Date.now()}`;

  if (queue.some(q => q.idempotencyKey === idempotencyKey)) {
    throw new Error(
      `Duplicate queued assessment (idempotencyKey=${idempotencyKey})`
    );
  }

  const now = new Date().toISOString();
  const entry: QueuedAssessment = {
    localId: makeLocalId(),
    idempotencyKey,
    serverId: null,
    athleteId: input.athleteId,
    sport: input.sport,
    testType: input.testType,
    category: input.category,
    notes: input.notes,
    localVideoUri: input.localVideoUri ?? null,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'pending',
    retryCount: 0,
    lastSyncAttemptAt: null,
    error: null
  };

  await writeQueue([...queue, entry]);
  return entry;
};

/** Returns all queued assessments, oldest first (FIFO synchronization order). */
export const getQueuedAssessments = async (): Promise<QueuedAssessment[]> => {
  const queue = await readQueue();
  return [...queue].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
};

export const getQueuedAssessmentById = async (
  localId: string
): Promise<QueuedAssessment | null> => {
  const queue = await readQueue();
  return queue.find(q => q.localId === localId) ?? null;
};

/**
 * Patch an entry (localId / idempotencyKey / createdAt are immutable).
 * updatedAt is refreshed automatically.
 */
export const updateQueuedAssessment = async (
  localId: string,
  patch: QueuedAssessmentPatch
): Promise<QueuedAssessment | null> => {
  const queue = await readQueue();
  const idx = queue.findIndex(q => q.localId === localId);
  if (idx === -1) return null;

  const safePatch: QueuedAssessmentPatch = { ...patch };
  delete (safePatch as any).localId;
  delete (safePatch as any).idempotencyKey;
  delete (safePatch as any).createdAt;

  const updated: QueuedAssessment = {
    ...queue[idx],
    ...safePatch,
    updatedAt: new Date().toISOString()
  };
  queue[idx] = updated;
  await writeQueue(queue);
  return updated;
};

/** Removes an entry. Returns true when something was removed. */
export const removeQueuedAssessment = async (localId: string): Promise<boolean> => {
  const queue = await readQueue();
  const next = queue.filter(q => q.localId !== localId);
  if (next.length === queue.length) return false;
  await writeQueue(next);
  return true;
};

/** Drops all entries whose sync completed. Returns how many were removed. */
export const clearCompletedFromQueue = async (): Promise<number> => {
  const queue = await readQueue();
  const kept = queue.filter(q => q.syncStatus !== 'completed');
  const removed = queue.length - kept.length;
  if (removed > 0) await writeQueue(kept);
  return removed;
};

/** Convenience: number of entries still awaiting synchronization. */
export const countPendingQueued = async (): Promise<number> => {
  const queue = await readQueue();
  return queue.filter(q => q.syncStatus !== 'completed').length;
};
