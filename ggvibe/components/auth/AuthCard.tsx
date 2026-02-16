import { GlowLogo } from './GlowLogo';
import { MagicLinkButton } from './MagicLinkButton';
import { OnboardingCarousel } from './OnboardingCarousel';
import { PhoneOtpPanel } from './PhoneOtpPanel';
import { ProviderButtons } from './ProviderButtons';
import { SocialProofBar } from './SocialProofBar';

interface Props { variant: 'A' | 'B' | 'C' }

export function AuthCard({ variant }: Props) {
  const cardWidth = variant === 'A' ? 460 : variant === 'B' ? 540 : 620;
  return (
    <section style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: cardWidth, margin: '24px auto', padding: 20, borderRadius: 18, border: '1px solid rgba(0,224,255,.3)', background: 'rgba(11,16,30,.72)', backdropFilter: 'blur(14px)', boxShadow: '0 0 40px rgba(0,224,255,.15)' }}>
      <GlowLogo />
      <p style={{ color: '#98acd3', textAlign: 'center' }}>Choose one secure sign-in method.</p>

      <video muted loop autoPlay playsInline preload="none" style={{ width: '100%', borderRadius: 12, marginBottom: 14, background: '#070a14' }}>
        <source src="/videos/preview-loop.mp4" type="video/mp4" />
        Preview unavailable.
      </video>
      <ProviderButtons />
      <div style={{ marginTop: 14 }}><MagicLinkButton /></div>
      <div style={{ marginTop: 14 }}><PhoneOtpPanel /></div>
      <div style={{ marginTop: 16 }}><SocialProofBar /></div>
      {variant !== 'A' && <div style={{ marginTop: 16 }}><OnboardingCarousel /></div>}
    </section>
  );
}
