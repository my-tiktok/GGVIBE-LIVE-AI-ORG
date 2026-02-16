import { HowItWorksVideoCard } from './HowItWorksVideoCard';

export function OnboardingCarousel() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <HowItWorksVideoCard title="Create" src="/videos/how-send.mp4" description="Send your first request in seconds." />
      <HowItWorksVideoCard title="Share" src="/videos/how-share.mp4" description="Share responses instantly with your audience." />
      <HowItWorksVideoCard title="Earn" src="/videos/how-earn.mp4" description="Monetize your AI workflows with confidence." />
    </div>
  );
}
