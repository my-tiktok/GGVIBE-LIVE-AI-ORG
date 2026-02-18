import 'server-only';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase-admin';

export type WalletSummary = {
  available: number;
  pending: number;
  currency: string;
};

export type TransactionRow = {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  createdAt: string;
};

export async function getWalletSummary(uid: string): Promise<WalletSummary> {
  try {
    const db = getAdminFirestore();
    const doc = await db.collection('wallets').doc(uid).get();
    const data = doc.data() as Partial<WalletSummary> | undefined;
    return {
      available: Number(data?.available ?? 0),
      pending: Number(data?.pending ?? 0),
      currency: data?.currency || 'USD',
    };
  } catch {
    return { available: 0, pending: 0, currency: 'USD' };
  }
}

export async function getTransactions(uid: string): Promise<TransactionRow[]> {
  try {
    const db = getAdminFirestore();
    const snapshot = await db
      .collection('transactions')
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    return snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data() as {
        amount?: number;
        type?: 'credit' | 'debit';
        createdAt?: { toDate?: () => Date } | string;
      };
      const createdAt =
        typeof data.createdAt === 'string'
          ? data.createdAt
          : data.createdAt && typeof data.createdAt === 'object' && typeof data.createdAt.toDate === 'function'
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString();

      return {
        id: doc.id,
        amount: Number(data.amount ?? 0),
        type: data.type === 'debit' ? 'debit' : 'credit',
        createdAt,
      };
    });
  } catch {
    return [];
  }
}

export async function getSellerOverview(uid: string) {
  try {
    const db = getAdminFirestore();
    const [listingSnap, transactionSnap] = await Promise.all([
      db.collection('listings').where('sellerId', '==', uid).count().get(),
      db.collection('transactions').where('uid', '==', uid).limit(20).get(),
    ]);

    const listingCount = listingSnap.data().count;
    const revenueToday = transactionSnap.docs
      .map((doc: QueryDocumentSnapshot) => doc.data() as { amount?: number; type?: 'credit' | 'debit' })
      .filter((row: { amount?: number; type?: 'credit' | 'debit' }) => row.type === 'credit')
      .reduce((sum: number, row: { amount?: number; type?: 'credit' | 'debit' }) => sum + Number(row.amount ?? 0), 0);

    return {
      listingCount,
      ordersToday: transactionSnap.docs.length,
      revenueToday,
    };
  } catch {
    return { listingCount: 0, ordersToday: 0, revenueToday: 0 };
  }
}
