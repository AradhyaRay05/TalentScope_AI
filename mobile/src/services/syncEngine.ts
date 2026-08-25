import {
  getQueuedAssessments,
  updateQueuedAssessment,
  QueuedAssessment
} from './assessmentQueue';
import { createAssessment, updateAssessmentStatus, getAssessmentHistory } from './api';
import { getNetworkStatus, subscribeToNetwork } from './network';
import { SyncErrorCategory } from './assessmentQueue';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { cleanupOrphanedVideos } from './storageManager';

/**
 * Offline assessment synchronization engine.
 *
 * Triggered automatically on offline ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ online transitions (and once after boot).
 * Processes the persistent queue strictly one-at-a-time using ONLY the existing
 * assessment lifecycle APIs (createAssessment / updateAssessmentStatus).
 *
 * Queue state machine:
 *   pending   ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ uploading ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ processing   (server has it; awaiting analysis)
 *   pending   ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ failed                   (non-network error, retries exhausted)
 *   failed    ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ uploading                (auto-retried while retryCount < MAX)
 *
 * 'processing' is NOT treated as completed ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â completion happens when the user
 * finalizes the assessment in AnalysisResultsScreen.
 */

const MAX_AUTO_RETRIES = 5;

export type SyncEventType =
  | 'sync-start'
  | 'sync-end'
  | 'entry-synced'
  | 'entry-failed'
  | 'auth-expired';

export interface SyncEvent {
  type: SyncEventType;
  localId?: string;
  detail?: string;
}

let running = false;
let initialized = false;
const listeners = new Set<(e: SyncEvent) => void>();

const emit = (e: SyncEvent) => {
  listeners.forEach(l => {
    try { l(e); } catch {}
  });
};

export const subscribeSyncEvents = (cb: (e: SyncEvent) => void): (() => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};

const isAuthError = (e: any): boolean => e?.status === 401 || e?.status === 403;

/** Categories eligible for automatic retry (with increasing backoff) */
const TEMPORARY_CATEGORIES: SyncErrorCategory[] = ['network', 'server_unavailable', 'upload_failed'];

/** Exponential backoff schedule for temporary failures: 30s ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ 60s ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ 2m ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ 5m ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ 10m */
const retryDelayMs = (attempt: number): number => {
  const delays = [30000, 60000, 120000, 300000, 600000];
  return delays[Math.min(Math.max(attempt - 1, 0), delays.length - 1)];
};

/**
 * Maps any synchronization error to a stable category + a user-friendly message.
 * Temporary categories auto-retry; auth/invalid_data/permanent do not.
 */
const classifyError = (e: any): { category: SyncErrorCategory; userMessage: string } => {
  const status: number | undefined = e?.status;
  const raw = String(e?.message || '');

  if (isAuthError(e)) {
    return { category: 'auth', userMessage: 'Session expired ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â log in again to sync' };
  }
  if (status === 400 || status === 404 || status === 422) {
    return { category: 'invalid_data', userMessage: 'Assessment data is invalid ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â fix or delete this entry' };
  }
  if (status && status >= 500) {
    if (/validation failed|is not a valid enum value|Cast to .* failed|is required/i.test(raw)) {
      return { category: 'invalid_data', userMessage: 'Assessment data is invalid â€” fix or delete this entry' };
    }
    return { category: 'server_unavailable', userMessage: 'Server unavailable â€” will retry automatically' };
  }
  if (status) {
    return { category: 'permanent', userMessage: 'Rejected by server' };
  }
  if (/timed out|Failed to fetch|Network request/i.test(raw)) {
    return { category: 'network', userMessage: 'No connection ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â will retry automatically' };
  }
  return { category: 'upload_failed', userMessage: 'Upload failed ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â will retry automatically' };
};

const isNetworkError = (e: any): boolean => {
  const msg = String(e?.message || '');
  return (
    e?.name === 'AbortError' ||
    msg.includes('Failed to fetch') ||
    msg.includes('Network request') ||
    msg.includes('timed out')
  );
};

/**
 * If a create request timed out / connection dropped mid-flight, the assessment
 * may already exist server-side. Adopt it from history instead of creating a
 * duplicate: match sport + testType created within ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±3 minutes of our attempt,
 * excluding assessments already claimed by other queue entries.
 */
const adoptOrphanServerRecord = async (
  entry: QueuedAssessment,
  claimedServerIds: Set<string>
): Promise<string | null> => {
  try {
    const res: any = await getAssessmentHistory();
    const list: any[] = res?.data ?? res ?? [];
    const attemptAt = entry.lastSyncAttemptAt ? new Date(entry.lastSyncAttemptAt).getTime() : Date.now();
    const candidate = list.find(a => {
      if (!a?._id || claimedServerIds.has(a._id)) return false;
      if (String(a.testType || '') !== String(entry.testType)) return false;
      if (String(a.sport || '') !== String(entry.sport)) return false;
      const created = new Date(a.createdAt).getTime();
      return Math.abs(created - attemptAt) < 180000;
    });
    return candidate?._id ?? null;
  } catch {
    return null;
  }
};

/**
 * Validates a stored local video reference. Returns true when the referenced
 * file is confirmed missing (definitive) â€” callers mark the entry failed with
 * a recoverable reason instead of crashing. Unverifiable platforms pass.
 */
const isVideoReferenceMissing = async (uri: string | null): Promise<boolean> => {
  if (!uri) return false;
  if (Platform.OS === 'web') return false; // web cannot verify file:// paths
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info.exists === false;
  } catch {
    return false; // cannot verify â€” never block synchronization on this
  }
};

/** Synchronizes ONE queue entry through the existing assessment lifecycle. */
const syncEntry = async (entry: QueuedAssessment): Promise<void> => {
  // A vanished local recording must fail gracefully, not crash the run
  if (await isVideoReferenceMissing(entry.localVideoUri)) {
    await updateQueuedAssessment(entry.localId, {
      syncStatus: 'failed',
      errorCategory: 'upload_failed',
      error: 'Saved recording file is no longer available. Retry will sync this assessment without the video.',
      nextAttemptAt: null
    });
    emit({ type: 'entry-failed', localId: entry.localId, detail: 'local video reference missing' });
    throw Object.assign(new Error('Local video reference missing'), { permanentSkip: true });
  }

  await updateQueuedAssessment(entry.localId, {
    syncStatus: 'uploading',
    lastSyncAttemptAt: new Date().toISOString()
  });

  let serverId = entry.serverId;
  const hadServerId = Boolean(serverId);

  // 1. Ensure the assessment exists on the server
  if (!serverId) {
    try {
      const created: any = await createAssessment({
        sport: entry.sport,
        testType: entry.testType,
        category: entry.category || entry.sport,
        notes: entry.notes,
        videoUrl: null
      });
      serverId = created?.data?._id ?? null;
      if (!serverId) throw new Error('Malformed response: missing assessment id');
      await updateQueuedAssessment(entry.localId, { serverId });
    } catch (e: any) {
      if (isAuthError(e)) throw e;
      // Unknown outcome (timeout / dropped connection): try to adopt instead of duplicating
      if (isNetworkError(e) && !serverId) {
        const all = await getQueuedAssessments();
        const claimed = new Set(all.map(q => q.serverId).filter(Boolean) as string[]);
        const adopted = await adoptOrphanServerRecord(
          { ...entry, lastSyncAttemptAt: new Date().toISOString() },
          claimed
        );
        if (adopted) {
          serverId = adopted;
          await updateQueuedAssessment(entry.localId, { serverId });
        }
      }
      if (!serverId) throw e;
    }
  }

  // 2. Push into processing (tolerate re-entry: transition may already be applied)
  try {
    await updateAssessmentStatus(serverId as string, 'processing');
  } catch (e: any) {
    if (!hadServerId) throw e;
    // Prior run may have already set processing ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â verify it still exists & is ours
    const hist: any = await getAssessmentHistory();
    const list: any[] = hist?.data ?? hist ?? [];
    const mine = list.find(a => a._id === serverId);
    if (!mine) throw e;
  }

  // 3. Server has it and is processing ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â keep the record locally until analysis completes
  await updateQueuedAssessment(entry.localId, {
    syncStatus: 'processing',
    error: null,
    errorCategory: null,
    nextAttemptAt: null
  });
  emit({ type: 'entry-synced', localId: entry.localId, detail: serverId ?? undefined });
};

/**
 * Processes all pending entries FIFO, one at a time. Safe to call repeatedly:
 * single-flight lock + per-entry state prevents duplicates and re-work.
 */
export const syncPendingAssessments = async (): Promise<{
  processed: number;
  synced: number;
  failed: number;
}> => {
  if (running) return { processed: 0, synced: 0, failed: 0 };
  if (getNetworkStatus() !== 'online') return { processed: 0, synced: 0, failed: 0 };

  running = true;
  emit({ type: 'sync-start' });
  let synced = 0;
  let failed = 0;
  let processed = 0;

  try {
    const now = Date.now();
    const queue = await getQueuedAssessments();
    const candidates = queue.filter(q => {
      if (q.syncStatus !== 'pending' && q.syncStatus !== 'uploading' && q.syncStatus !== 'failed') {
        return false;
      }
      // Permanent failures never auto-retry
      if (q.syncStatus === 'failed') {
        const temporary =
          q.errorCategory && TEMPORARY_CATEGORIES.includes(q.errorCategory);
        if (!temporary || (q.retryCount || 0) >= MAX_AUTO_RETRIES) return false;
      }
      // Respect exponential backoff window
      if (q.nextAttemptAt && now < new Date(q.nextAttemptAt).getTime()) return false;
      return true;
    });

    for (const entry of candidates) {
      // Network disappeared mid-run ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â stop; remaining entries stay untouched
      if (getNetworkStatus() !== 'online') break;

      processed++;
      await updateQueuedAssessment(entry.localId, {
        retryCount: (entry.retryCount || 0) + 1,
        lastSyncAttemptAt: new Date().toISOString()
      });

      try {
        await syncEntry({
          ...entry,
          retryCount: (entry.retryCount || 0) + 1
        });
        synced++;
      } catch (e: any) {
        if (e?.permanentSkip) {
          // Already marked failed inside syncEntry â€” counted, no further changes
          failed++;
          continue;
        }
        failed++;
        const { category, userMessage } = classifyError(e);

        if (category === 'auth') {
          // Session expired: keep data, require manual re-login; stop the whole run
          await updateQueuedAssessment(entry.localId, {
            syncStatus: 'failed',
            errorCategory: category,
            error: userMessage,
            nextAttemptAt: null
          });
          emit({ type: 'auth-expired', localId: entry.localId, detail: userMessage });
          break;
        }

        if (TEMPORARY_CATEGORIES.includes(category)) {
          // Temporary: schedule automatic retry with increasing backoff
          const nextAt = new Date(Date.now() + retryDelayMs((entry.retryCount || 0) + 1)).toISOString();
          await updateQueuedAssessment(entry.localId, {
            syncStatus: 'pending',
            errorCategory: category,
            error: userMessage,
            nextAttemptAt: nextAt
          });
        } else {
          // Permanent / invalid: never auto-retry Ã¢â‚¬â€ manual retry only
          await updateQueuedAssessment(entry.localId, {
            syncStatus: 'failed',
            errorCategory: category,
            error: userMessage,
            nextAttemptAt: null
          });
        }
        emit({ type: 'entry-failed', localId: entry.localId, detail: `${category}: ${userMessage}` });
      }
    }
  } finally {
    running = false;
    emit({ type: 'sync-end', detail: `${synced} synced, ${failed} failed` });
  }

  return { processed, synced, failed };
};

/** Wire automatic triggers: offline ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ online transition + shortly after boot. */
export const initSyncEngine = () => {
  if (initialized) return;
  initialized = true;

  // Deterministic recovery of interrupted uploads before any sync attempt
  void (async () => {
    await recoverQueuedAssessments();
    await cleanupOrphanedVideos();
  })();

  subscribeToNetwork(status => {
    if (status === 'online') void syncPendingAssessments();
  });

  setTimeout(() => {
    if (getNetworkStatus() === 'online') void syncPendingAssessments();
  }, 3000);

  // Periodic sweep so temporary failures retry even without a new
  // connectivity transition. Per-entry backoff windows prevent hot-looping.
  setInterval(() => {
    if (getNetworkStatus() === 'online') void syncPendingAssessments();
  }, 60000);
};

/**
 * Manual retry: re-queues ALL failed entries (including permanent/invalid ones â€”
 * the user explicitly asked) and runs a synchronization pass immediately.
 */
export const retryFailedSync = async (): Promise<void> => {
  const queue = await getQueuedAssessments();
  for (const q of queue.filter(x => x.syncStatus === 'failed')) {
    // A missing recording file is not recoverable — retry saves metadata-only
    const videoGone =
      q.errorCategory === 'upload_failed' && /no longer available/i.test(q.error || '');
    await updateQueuedAssessment(q.localId, {
      syncStatus: 'pending',
      nextAttemptAt: null,
      localVideoUri: videoGone ? null : q.localVideoUri
    });
  }
  await syncPendingAssessments();
};

/**
 * Deterministic startup recovery for interrupted synchronization.
 *
 * - 'uploading' without serverId  ? back to 'pending' (upload never confirmed)
 * - 'uploading' with serverId     ? 'processing' (server already has the record)
 * - missing local video reference ? 'failed' with a recoverable reason
 * - completed entries are never touched; nothing is ever auto-deleted
 */
export const recoverQueuedAssessments = async (): Promise<void> => {
  try {
    const queue = await getQueuedAssessments();
    for (const entry of queue) {
      if (entry.syncStatus === 'uploading') {
        await updateQueuedAssessment(entry.localId, {
          syncStatus: entry.serverId ? 'processing' : 'pending'
        });
        continue;
      }
      if (entry.syncStatus !== 'completed' && (await isVideoReferenceMissing(entry.localVideoUri))) {
        await updateQueuedAssessment(entry.localId, {
          syncStatus: 'failed',
          errorCategory: 'upload_failed',
          error:
            'Saved recording file is no longer available on this device. Retry will sync this assessment without the video.',
          nextAttemptAt: null
        });
      }
    }
  } catch (e) {
    console.warn('[SyncEngine] recovery failed:', e?.message);
    console.warn('[SyncEngine] recovery stack:', e?.stack?.split('\n').slice(0, 4).join(' | '));
  }
};
