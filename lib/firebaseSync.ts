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

/**
 * Direct real-time subscription to a Cloud Firestore collection.
 * Adheres to Firebase React Guidelines: Only attach onSnapshot listeners if auth is ready and user is authenticated.
 */
export function subscribeToCollection<T extends Record<string, any>>(
  collectionName: string,
  idField: string,
  initialData: T[],
  onData: (data: T[]) => void
): Unsubscribe {
  let unsubscribeSnapshot: Unsubscribe | null = null;

  // Track auth state - only attach real-time onSnapshot listeners if the user is authenticated
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
              const items = snapshot.docs.map((d) => {
                const raw = d.data();
                return {
                  ...raw,
                  [idField]: d.id,
                } as T;
              });
              onData(items);
            } else {
              // Connected to Cloud Database: collection is empty, so clear all sample data
              onData([]);
            }
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, collectionName);
            onData([]);
          }
        );
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, collectionName);
        onData([]);
      }
    } else {
      // Unauthenticated: safely present initial data without firing unauthorized listener errors
      onData(initialData);
    }
  });

  return () => {
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
 * Wipe all sample data across all collections in the Cloud Database
 */
export async function clearAllSampleData(): Promise<{ success: boolean; clearedCollections: string[] }> {
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

  const cleared: string[] = [];
  for (const col of collectionsToClear) {
    await clearCollection(col);
    cleared.push(col);
  }
  return { success: true, clearedCollections: cleared };
}

/**
 * Direct save (create or update) to Cloud Firestore
 */
export async function saveItem<T extends Record<string, any>>(
  collectionName: string,
  item: T,
  idField: string = 'id',
  _userId: string | null = null
): Promise<boolean> {
  const docId = String(item[idField] || (item as any).id || (item as any).voucherId || Date.now());
  const path = `${collectionName}/${docId}`;

  try {
    const docRef = doc(db, collectionName, docId);
    const sanitized = sanitizeForFirestore({
      ...item,
      [idField]: docId,
      _updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, sanitized, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Direct delete from Cloud Firestore
 */
export async function deleteItem(
  collectionName: string,
  docId: string,
  _idField: string = 'id',
  _userId: string | null = null
): Promise<boolean> {
  const path = `${collectionName}/${docId}`;
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    return false;
  }
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
