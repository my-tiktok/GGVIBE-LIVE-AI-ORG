'use client';

import { FormEvent, useState } from 'react';

type ProfileState = {
  displayName: string;
  bio: string;
  storeName: string;
};

export function SellerProfileForm({ initial }: { initial: Partial<ProfileState> | null }) {
  const [profile, setProfile] = useState<ProfileState>({
    displayName: initial?.displayName || '',
    bio: initial?.bio || '',
    storeName: initial?.storeName || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const response = await fetch('/api/seller/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      if (payload?.fieldErrors) {
        const firstField = Object.values(payload.fieldErrors).find(
          (value) => Array.isArray(value) && value.length > 0
        ) as string[] | undefined;
        setError(firstField?.[0] || payload?.message || 'Unable to save profile.');
      } else {
        setError(payload?.message || 'Unable to save profile.');
      }
      return;
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10, maxWidth: 500 }}>
      <input placeholder="Display name" value={profile.displayName} onChange={(event) => setProfile((prev) => ({ ...prev, displayName: event.target.value }))} />
      <input placeholder="Store name" value={profile.storeName} onChange={(event) => setProfile((prev) => ({ ...prev, storeName: event.target.value }))} />
      <textarea placeholder="Store bio" value={profile.bio} onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))} rows={4} />
      {error && <p style={{ color: '#ffb7b7' }}>{error}</p>}
      <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
    </form>
  );
}
