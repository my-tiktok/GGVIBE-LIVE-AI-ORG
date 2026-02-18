import { redirect } from 'next/navigation';
import { getServerViewer, isAdminEmail } from '@/lib/auth/server-viewer';

export default async function AdminPage() {
  const viewer = await getServerViewer();

  if (!viewer) {
    redirect('/login');
  }

  if (!isAdminEmail(viewer.email)) {
    redirect('/chat?error=forbidden');
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Admin</h1>
      <p style={{ color: '#9fb4df' }}>Environment and moderation summary.</p>
      <ul>
        <li>Runtime: {process.env.NODE_ENV}</li>
        <li>MCP: enabled</li>
        <li>Auth providers: Google, GitHub, Email, Phone OTP</li>
      </ul>
    </div>
  );
}
