'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Listing = {
  id: string;
  title: string;
  description: string;
  listingType: 'PHYSICAL' | 'DIGITAL' | 'FOOD';
  category: string;
  price: number;
  currency: string;
};

const chips: Array<Listing['listingType'] | 'ALL'> = ['ALL', 'PHYSICAL', 'DIGITAL', 'FOOD'];

export function MarketplaceGrid({ initialItems, locked }: { initialItems: Listing[]; locked: boolean }) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<(typeof chips)[number]>('ALL');
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  const filtered = useMemo(() => {
    let rows = initialItems.filter((item) =>
      [item.title, item.description, item.category].join(' ').toLowerCase().includes(query.toLowerCase())
    );

    if (type !== 'ALL') {
      rows = rows.filter((item) => item.listingType === type);
    }

    if (sort === 'price_asc') rows = [...rows].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') rows = [...rows].sort((a, b) => b.price - a.price);

    return rows;
  }, [initialItems, query, type, sort]);

  return (
    <section>
      <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search listings"
          style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(139,163,255,.35)', background: '#0c1430', color: '#e7eeff' }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setType(chip)}
              style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: chip === type ? '1px solid #8ba3ff' : '1px solid rgba(139,163,255,.35)',
                background: chip === type ? 'rgba(139,163,255,.2)' : 'transparent',
                color: '#e7eeff',
              }}
            >
              {chip}
            </button>
          ))}
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as typeof sort)}
            style={{ padding: 6, borderRadius: 8, background: '#0c1430', color: '#e7eeff', border: '1px solid rgba(139,163,255,.35)' }}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>
      </div>

      {locked ? (
        <div style={{ border: '1px solid rgba(237,186,49,.35)', borderRadius: 12, padding: 14, background: 'rgba(237,186,49,.08)' }}>
          <strong>Marketplace is locked.</strong>
          <p style={{ marginBottom: 0 }}>Activate MONTHLY or ANNUAL on <Link href="/plans">Plans</Link> to unlock listings.</p>
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#8ca2cc' }}>No listings matched your filters.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {filtered.map((item) => (
            <Link key={item.id} href={`/marketplace/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article style={{ border: '1px solid rgba(132,162,255,.28)', borderRadius: 12, padding: 12, background: '#0c1430' }}>
                <div style={{ fontSize: 12, color: '#8ca2cc' }}>{item.listingType} • {item.category}</div>
                <h3 style={{ margin: '8px 0' }}>{item.title}</h3>
                <p style={{ color: '#9fb4df', minHeight: 46 }}>{item.description.slice(0, 90)}</p>
                <strong>{item.currency} {item.price.toFixed(2)}</strong>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
