import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { getQueuedAssessments, updateQueuedAssessment, removeQueuedAssessment } from './assessmentQueue';

/**
 * Local storage management for offline assessments.
 *
 * Videos live as individual files under cacheDirectory/offline-assessments/.
 * Policy:
 *  - A video referenced by a queued entry is NEVER deleted while that entry
 *    still needs synchronization.
 *  - Once synchronization completes, the video is removed.
 *  - Files with no matching queue entry (abandoned recordings / crashed
 *    pre-save writes) are treated as orphans and cleaned on startup.
 * - Insufficient free space is detected BEFORE recording is saved.
 * - Filesystem paths are never surfaced to users.
 */

const OFFLINE_DIR_NAME = 'offline-assessments';
/** Minimum free disk space required before accepting a new recording (bytes) */
export const MIN_FREE_DISK_BYTES = 50 * 1024 * 1024;

const getOfflineDir = (): string | null => {
  const base = (FileSystem as any).cacheDirectory;
  return base ? `${base}${OFFLINE_DIR_NAME}/` : null;
};

const safeGetInfo = async (uri: string): Promise<{ exists: boolean; size?: number; isDirectory?: boolean }> => {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    return { exists: info.exists === true, size: (info as any).size, isDirectory: (info as any).isDirectory };
  } catch {
    return { exists: false };
  }
};

const safeDelete = async (uri: string): Promise<void> => {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {}
};

/**
 * Free disk space in bytes, or null when the platform cannot report it.
 */
export const getFreeDiskBytes = async (): Promise<number | null> => {
  try {
    const f: any = FileSystem as any;
    if (typeof f.getFreeDiskStorageAsync === 'function') {
      return await f.getFreeDiskStorageAsync();
    }
  } catch {}
  return null;
};

/**
 * Throws when there is not enough space to accept a new offline recording.
 * Called BEFORE the recording file is written.
 */
export const assertEnoughStorageForRecording = async (): Promise<void> => {
  const free = await getFreeDiskBytes();
  if (free != null && free < MIN_FREE_DISK_BYTES) {
    const mb = Math.round(free / (1024 * 1024));
    const err: any = new Error(
      `Not enough storage on this device (${mb} MB free). Free up space and try again.`
    );
    err.code = 'INSUFFICIENT_STORAGE';
    throw err;
  }
};

/**
 * Deletes the local video file belonging to an entry identified by its server
 * assessment id. Called AFTER confirmed synchronization completion.
 */
export const deleteVideoForServerId = async (serverId: string): Promise<boolean> => {
  try {
    const queue = await getQueuedAssessments();
    const entry = queue.find(q => q.serverId === serverId);
    if (!entry) return false;
    if (entry.localVideoUri && !Platform.OS.startsWith('web')) {
      await safeDelete(entry.localVideoUri);
    }
    // Completed entries leave the queue entirely
    await removeQueuedAssessment(entry.localId);
    return true;
  } catch {
    return false;
  }
};

/**
 * Removes orphaned recording files: files inside the offline directory that
 * are not referenced by ANY queue entry. Never touches referenced videos,
 * even for failed entries (they may still be retried).
 */
export const cleanupOrphanedVideos = async (): Promise<number> => {
  if (Platform.OS === 'web') return 0;
  const dir = getOfflineDir();
  if (!dir) return 0;

  let removed = 0;
  try {
    const queue = await getQueuedAssessments();
    const referenced = new Set(queue.map(q => q.localVideoUri).filter(Boolean) as string[]);

    const entries = await FileSystem.readDirectoryAsync(dir);
    for (const name of entries) {
      const uri = `${dir}${name}`;
      if (referenced.has(uri)) continue;
      const info = await safeGetInfo(uri);
      if (!info.exists || info.isDirectory) continue;
      await safeDelete(uri);
      removed++;
    }
  } catch (e) {
    console.warn('[StorageManager] orphan cleanup skipped:', e);
  }
  return removed;
};

/**
 * Full storage report for diagnostics/UI:
 * how many queued assessments carry local videos and their total size.
 */
export const getOfflineStorageSummary = async (): Promise<{
  queuedVideos: number;
  totalVideoBytes: number;
  freeBytes: number | null;
}> => {
  let queuedVideos = 0;
  let totalVideoBytes = 0;
  try {
    const queue = await getQueuedAssessments();
    for (const q of queue) {
      if (!q.localVideoUri) continue;
      const info = await safeGetInfo(q.localVideoUri);
      if (info.exists) {
        queuedVideos++;
        totalVideoBytes += info.size ?? 0;
      }
    }
  } catch {}
  const freeBytes = await getFreeDiskBytes();
  return { queuedVideos, totalVideoBytes, freeBytes };
};
