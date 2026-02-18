import Link from 'next/link';

const tiers = [
  { name: 'MONTHLY', price: '$29/mo', features: ['Marketplace access', 'Seller analytics', 'Priority support'] },
  { name: 'ANNUAL', price: '$290/yr', features: ['Everything in Monthly', '2 months free', 'Early beta access'] },
];

export default function PlansPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Plans</h1>
      <p style={{ color: '#9fb4df' }}>Marketplace access requires an active MONTHLY or ANNUAL entitlement.</p>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {tiers.map((tier) => (
          <article key={tier.name} style={{ border: '1px solid rgba(132,162,255,.28)', borderRadius: 12, padding: 14, background: '#0c1430' }}>
            <h2 style={{ marginTop: 0 }}>{tier.name}</h2>
            <p><strong>{tier.price}</strong></p>
            <ul>
              {tier.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p style={{ color: '#8ca2cc' }}>
        For dev activation, admins can call <code>POST /api/dev/activate-plan</code>. Then continue to <Link href="/marketplace">Marketplace</Link>.
      </p>
    </div>
  );
}
