import { SellerProfileForm } from '@/components/seller/seller-profile-form';
import { getServerViewer } from '@/lib/auth/server-viewer';
import { getSellerProfile } from '@/lib/seller/profile';

export default async function SellerPage() {
  const viewer = await getServerViewer();
  const data = viewer ? await getSellerProfile(viewer.uid) : { profile: null };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Seller Profile</h1>
      <p style={{ color: '#9fb4df' }}>Set up your seller profile before publishing listings.</p>
      <SellerProfileForm initial={data.profile as { displayName?: string; bio?: string; storeName?: string } | null} />
    </div>
  );
}
