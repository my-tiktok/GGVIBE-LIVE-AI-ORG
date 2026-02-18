import 'server-only';
import { FieldValue, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { z } from 'zod';
import { getAdminFirestore } from '@/lib/firebase-admin';

export const listingTypeSchema = z.enum(['PHYSICAL', 'DIGITAL', 'FOOD']);

export const listingInputSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  listingType: listingTypeSchema,
  category: z.string().min(2).max(60),
  price: z.number().nonnegative(),
  currency: z.string().min(3).max(3).default('USD'),
  images: z.array(z.string().url()).max(6).default([]),
});

export type MarketplaceListing = z.infer<typeof listingInputSchema> & {
  id: string;
  sellerId: string;
  createdAt: string;
};

const fallbackListings: MarketplaceListing[] = [
  {
    id: 'demo-physical-1',
    title: 'GGVIBE Neon Hoodie',
    description: 'Premium heavyweight hoodie with reflective logo print.',
    listingType: 'PHYSICAL',
    category: 'Apparel',
    price: 79,
    currency: 'USD',
    images: [],
    sellerId: 'demo-seller',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-digital-1',
    title: 'Creator Launch Checklist',
    description: 'Digital playbook for launching your creator storefront.',
    listingType: 'DIGITAL',
    category: 'Guides',
    price: 19,
    currency: 'USD',
    images: [],
    sellerId: 'demo-seller',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-food-1',
    title: 'Chef Tasting Box',
    description: 'Curated weekly gourmet tasting box with seasonal ingredients.',
    listingType: 'FOOD',
    category: 'Food',
    price: 49,
    currency: 'USD',
    images: [],
    sellerId: 'demo-seller',
    createdAt: new Date().toISOString(),
  },
];

export async function listMarketplaceListings(limit = 12, cursor?: string) {
  try {
    const db = getAdminFirestore();
    const size = Math.min(Math.max(limit, 1), 30);
    let query = db.collection('listings').orderBy('createdAt', 'desc').limit(size);

    if (cursor) {
      const cursorDoc = await db.collection('listings').doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.get();
    const listings = snapshot.docs.map((doc: QueryDocumentSnapshot) => {
      const data = doc.data() as Omit<MarketplaceListing, 'id' | 'createdAt'> & {
        createdAt?: { toDate?: () => Date } | string;
      };
      const rawCreatedAt = data.createdAt;
      const createdAt =
        typeof rawCreatedAt === 'string'
          ? rawCreatedAt
          : rawCreatedAt && typeof rawCreatedAt === 'object' && typeof rawCreatedAt.toDate === 'function'
            ? rawCreatedAt.toDate().toISOString()
            : new Date().toISOString();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        listingType: data.listingType,
        category: data.category,
        price: data.price,
        currency: data.currency,
        images: data.images || [],
        sellerId: data.sellerId,
        createdAt,
      } satisfies MarketplaceListing;
    });

    return {
      listings,
      nextCursor: snapshot.docs.length === size ? snapshot.docs[snapshot.docs.length - 1].id : null,
      source: 'firestore' as const,
    };
  } catch {
    return {
      listings: fallbackListings.slice(0, limit),
      nextCursor: null,
      source: 'fallback' as const,
    };
  }
}

export async function getMarketplaceListingById(id: string): Promise<MarketplaceListing | null> {
  try {
    const db = getAdminFirestore();
    const doc = await db.collection('listings').doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as Omit<MarketplaceListing, 'id' | 'createdAt'> & {
      createdAt?: { toDate?: () => Date } | string;
    };
    const rawCreatedAt = data.createdAt;
    const createdAt =
      typeof rawCreatedAt === 'string'
        ? rawCreatedAt
        : rawCreatedAt && typeof rawCreatedAt === 'object' && typeof rawCreatedAt.toDate === 'function'
          ? rawCreatedAt.toDate().toISOString()
          : new Date().toISOString();

    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      listingType: data.listingType,
      category: data.category,
      price: data.price,
      currency: data.currency,
      images: data.images || [],
      sellerId: data.sellerId,
      createdAt,
    };
  } catch {
    return fallbackListings.find((listing) => listing.id === id) || null;
  }
}

export async function createMarketplaceListing(input: z.infer<typeof listingInputSchema> & { sellerId: string }) {
  const db = getAdminFirestore();
  const payload = listingInputSchema.parse(input);

  const ref = await db.collection('listings').add({
    ...payload,
    sellerId: input.sellerId,
    createdAt: FieldValue.serverTimestamp(),
  });

  return ref.id;
}
