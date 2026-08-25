import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { AppState } from 'react-native';

export type NetworkStatus = 'online' | 'offline' | 'unknown';

let current: NetworkStatus = 'unknown';
let initialized = false;
const listeners = new Set<(s: NetworkStatus) => void>();

const notify = () => {
  listeners.forEach(listener => {
    try {
      listener(current);
    } catch (e) {
      console.warn('[Network] listener error', e);
    }
  });
};

const setStatus = (next: NetworkStatus) => {
  if (next === current) return;
  current = next;
  notify();
};

const mapNetInfoState = (state: NetInfoState): NetworkStatus => {
  const connected = state.isConnected === true;
  const reachable: boolean | null | undefined = state.isInternetReachable as boolean | null | undefined;
  if (!connected) return 'offline';
  if (reachable === false) return 'offline';
  if (reachable === true || reachable == null) return 'online';
  return current === 'unknown' ? 'unknown' : current;
};

const handleNetInfoChange = (state: NetInfoState) => {
  setStatus(mapNetInfoState(state));
};

/**
 * Idempotently wires system connectivity listeners:
 * - NetInfo pushes changes (no polling)
 * - App foregrounding re-checks to catch interruptions that happened in background
 */
export const initNetworkListener = () => {
  if (initialized) return;
  initialized = true;

  void NetInfo.fetch().then(handleNetInfoChange).catch(() => {});
  NetInfo.addEventListener(handleNetInfoChange);

  AppState.addEventListener('change', appState => {
    if (appState === 'active') {
      void refreshNetworkState();
    }
  });
};

/** Re-query the device for fresh connectivity; resolves with the new status. */
export const refreshNetworkState = async (): Promise<NetworkStatus> => {
  try {
    const state = await NetInfo.fetch();
    handleNetInfoChange(state);
  } catch (e) {
    console.warn('[Network] refresh failed', e);
  }
  return current;
};

export const getNetworkStatus = (): NetworkStatus => current;

export const isOnline = (): boolean => current === 'online';

/** Subscribe to status changes. Returns an unsubscribe function. */
export const subscribeToNetwork = (listener: (s: NetworkStatus) => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
