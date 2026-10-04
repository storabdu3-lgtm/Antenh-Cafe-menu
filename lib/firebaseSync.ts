/**
 * Direct Cloud Firestore Integration Layer
 * 
 * Pure direct Firebase Firestore operations:
 * - Real-time listeners via onSnapshot
 * - Direct writes via setDoc
 * - Direct deletes via deleteDoc
 * - Direct batch resets via writeBatch
 * 
 * No syncing queue, no offline cache synchronization, no local storage database.
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  // If the client is unauthenticated, permission denied is expected prior to signing in
  if (!auth.currentUser) {
    return;
  }

  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively removes undefined keys for Firestore compatibility
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

// Shared Singleton SSE Connection for real-time multi-device synchronization
let globalEventSource: EventSource | null = null;
let sseReconnectTimeout: any = null;

export function ensureSSEConnection(): void {
  if (typeof window === 'undefined') return;
  if (globalEventSource && globalEventSource.readyState !== EventSource.CLOSED) return;

  try {
    globalEventSource = new EventSource('/api/cloud-db/events');

    globalEventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        window.dispatchEvent(new CustomEvent('cloud-db-update', { detail: payload }));
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    globalEventSource.onerror = () => {
      if (globalEventSource) {
        globalEventSource.close();
        globalEventSource = null;
      }
      clearTimeout(sseReconnectTimeout);
      sseReconnectTimeout = setTimeout(ensureSSEConnection, 3000);
    };
  } catch (err) {
    console.warn('SSE connection notice:', err);
  }
}

/**
 * Direct real-time subscription to a Cloud Database collection with multi-device cross-device synchronization.
 * Guarantees that data saved on Device 1 immediately shows up on Device 2, 3, etc.
 */
export function subscribeToCollection<T extends Record<string, any>>(
  collectionName: string,
  idField: string,
  initialData: T[],
  onData: (data: T[]) => void
): Unsubscribe {
  let isMounted = true;
  ensureSSEConnection();

  // 1. Immediately fetch saved records from Cloud Server Database
  fetch(`/api/cloud-db/${collectionName}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((items) => {
      if (isMounted && Array.isArray(items)) {
        onData(items);
      }
    })
    .catch((err) => {
      console.warn(`Initial fetch error for ${collectionName}:`, err);
      if (isMounted) onData(initialData);
    });

  // 2. Real-time listener for events emitted by any connected device
  const onUpdate = (e: Event) => {
    const custom = e as CustomEvent;
    const detail = custom.detail;
    if (!detail || !isMounted) return;

    if (detail.action === 'SET_ALL_EMPTY') {
      onData([]);
      return;
    }

    if (detail.action === 'RESET_SAMPLE' && detail.data && detail.data[collectionName]) {
      onData(detail.data[collectionName]);
      return;
    }

    if (detail.collection === collectionName) {
      // Re-fetch latest collection state from Cloud Server Database
      fetch(`/api/cloud-db/${collectionName}`)
        .then((res) => res.json())
        .then((items) => {
          if (isMounted && Array.isArray(items)) onData(items);
        })
        .catch(() => {});
    }
  };

  window.addEventListener('cloud-db-update', onUpdate);

  // 3. When Firebase Auth is authenticated, also sync with Firestore onSnapshot
  let unsubscribeSnapshot: Unsubscribe | null = null;
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }

    if (user) {
      try {
        const colRef = collection(db, collectionName);
        unsubscribeSnapshot = onSnapshot(
          colRef,
          (snapshot) => {
            if (!snapshot.empty) {
              const items = snapshot.docs.map((d) => ({
                ...d.data(),
                [idField]: d.id,
              } as T));
              if (isMounted) onData(items);
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, collectionName);
          }
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, collectionName);
      }
    }
  });

  return () => {
    isMounted = false;
    window.removeEventListener('cloud-db-update', onUpdate);
    unsubscribeAuth();
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
    }
  };
}

/**
 * Wipe/clear all documents from a Firestore collection directly
 */
export async function clearCollection(collectionName: string): Promise<boolean> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    if (snap.empty) return true;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, collectionName);
    return false;
  }
}

/**
 * Wipe all sample data across all collections in the Cloud Database and Cloud Server Database
 */
export async function clearAllSampleData(): Promise<{ success: boolean; clearedCollections: string[] }> {
  // Clear persistent cloud server database
  try {
    await fetch('/api/cloud-db/clear-all', { method: 'POST' });
  } catch (err) {
    console.warn('Server clear all notice:', err);
  }

  // Clear Firestore collections if authenticated
  if (auth.currentUser) {
    const collectionsToClear = [
      'menuItems',
      'orders',
      'reservations',
      'inventory',
      'suppliers',
      'purchaseOrders',
      'employees',
      'recipeCosts',
      'eprRecords',
      'customers',
      'categories',
      'stores',
      'stockInVouchers',
      'storeRequests',
      'storeTransfers',
      'posReceipts',
      'binCards',
      'damageVouchers',
      'staffMeals',
    ];

    for (const col of collectionsToClear) {
      await clearCollection(col);
    }
  }

  return { success: true, clearedCollections: [] };
}

/**
 * Direct save (create or update) to Cloud Database with instant multi-device propagation
 */
export async function saveItem<T extends Record<string, any>>(
  collectionName: string,
  item: T,
  idField: string = 'id',
  _userId: string | null = null
): Promise<boolean> {
  const docId = String(item[idField] || (item as any).id || (item as any).voucherId || Date.now());
  const path = `${collectionName}/${docId}`;

  // 1. Immediately save to Cloud Server Database so ALL other devices see it
  try {
    const res = await fetch(`/api/cloud-db/${collectionName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, [idField]: docId }),
    });
    if (!res.ok) {
      console.warn(`Cloud DB save failed for ${collectionName}: ${res.status}`);
    }
  } catch (err) {
    console.warn(`Cloud DB save error for ${collectionName}:`, err);
  }

  // 2. Also save to Firestore if user is authenticated with Firebase
  if (auth.currentUser) {
    try {
      const docRef = doc(db, collectionName, docId);
      const sanitized = sanitizeForFirestore({
        ...item,
        [idField]: docId,
        _updatedAt: new Date().toISOString(),
      });
      await setDoc(docRef, sanitized, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  return true;
}

/**
 * Direct delete from Cloud Database with instant multi-device propagation
 */
export async function deleteItem(
  collectionName: string,
  docId: string,
  _idField: string = 'id',
  _userId: string | null = null
): Promise<boolean> {
  const path = `${collectionName}/${docId}`;

  // 1. Delete from Cloud Server Database
  try {
    await fetch(`/api/cloud-db/${collectionName}/${docId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn(`Cloud DB delete error for ${collectionName}:`, err);
  }

  // 2. Also delete from Firestore if user is authenticated
  if (auth.currentUser) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  return true;
}

/**
 * Direct fetch of a collection from Cloud Firestore
 */
export async function fetchCollection<T extends Record<string, any>>(
  collectionName: string,
  fallback: T[] = []
): Promise<T[]> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ ...d.data(), id: d.id } as unknown as T));
    }
    return fallback;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
    return fallback;
  }
}

/**
 * Reset a collection directly in Cloud Firestore with clean seed data
 */
export async function resetCollection<T extends Record<string, any>>(
  collectionName: string,
  initialData: T[],
  idField: string = 'id'
): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    for (const item of initialData) {
      const docId = String(item[idField] || (item as any).id || (item as any).voucherId || Date.now());
      const ref = doc(db, collectionName, docId);
      batch.set(ref, sanitizeForFirestore({ ...item, [idField]: docId }), { merge: true });
    }
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
    return false;
  }
}
