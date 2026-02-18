import { notFound } from 'next/navigation';
import { getMarketplaceListingById } from '@/lib/marketplace/listings';

export default async function MarketplaceListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getMarketplaceListingById(id);
  if (!listing) {
    notFound();
  }

  return (
    <article>
      <p style={{ color: '#8ca2cc' }}>{listing.listingType} • {listing.category}</p>
      <h1 style={{ marginTop: 0 }}>{listing.title}</h1>
      <p style={{ color: '#9fb4df' }}>{listing.description}</p>
      <p>
        <strong>{listing.currency} {listing.price.toFixed(2)}</strong>
      </p>
      <p style={{ color: '#8ca2cc' }}>Seller: {listing.sellerId}</p>
    </article>
  );
}
