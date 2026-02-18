import 'server-only';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { getAdminFirestore } from '@/lib/firebase-admin';

export const sellerProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name is required').max(80),
  bio: z.string().min(10, 'Bio should be at least 10 characters').max(300),
  storeName: z.string().min(2, 'Store name is required').max(80),
});

export const payoutsSchema = z
  .object({
    btcAddress: z.string().optional().or(z.literal('')),
    ngnBankName: z.string().optional().or(z.literal('')),
    ngnAccountNumber: z.string().optional().or(z.literal('')),
    ngnAccountName: z.string().optional().or(z.literal('')),
  })
  .superRefine((value, ctx) => {
    if (value.btcAddress) {
      const isValidBtc = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{24,62}$/.test(value.btcAddress);
      if (!isValidBtc) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'BTC address format looks invalid.', path: ['btcAddress'] });
      }
    }

    const hasNgn = value.ngnBankName || value.ngnAccountNumber || value.ngnAccountName;
    if (hasNgn) {
      if (!value.ngnBankName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bank name is required for NGN payouts.', path: ['ngnBankName'] });
      }
      if (!value.ngnAccountName) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Account name is required for NGN payouts.', path: ['ngnAccountName'] });
      }
      if (!value.ngnAccountNumber || !/^\d{10}$/.test(value.ngnAccountNumber)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Account number must be 10 digits.', path: ['ngnAccountNumber'] });
      }
    }
  });

export type SellerProfileInput = z.infer<typeof sellerProfileSchema>;
export type PayoutsInput = z.infer<typeof payoutsSchema>;

export async function getSellerProfile(uid: string) {
  try {
    const db = getAdminFirestore();
    const [profileDoc, payoutDoc] = await Promise.all([
      db.collection('sellerProfiles').doc(uid).get(),
      db.collection('payoutsPreferences').doc(uid).get(),
    ]);

    return {
      profile: profileDoc.exists ? profileDoc.data() : null,
      payouts: payoutDoc.exists ? payoutDoc.data() : null,
    };
  } catch {
    return { profile: null, payouts: null };
  }
}

export async function saveSellerProfile(uid: string, input: SellerProfileInput) {
  const db = getAdminFirestore();
  const parsed = sellerProfileSchema.parse(input);

  await db
    .collection('sellerProfiles')
    .doc(uid)
    .set(
      {
        ...parsed,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

export async function savePayouts(uid: string, input: PayoutsInput) {
  const db = getAdminFirestore();
  const parsed = payoutsSchema.parse(input);
  await db
    .collection('payoutsPreferences')
    .doc(uid)
    .set(
      {
        ...parsed,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}
