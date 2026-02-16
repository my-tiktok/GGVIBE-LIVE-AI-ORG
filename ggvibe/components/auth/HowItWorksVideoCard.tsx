interface Props {
  title: string;
  src: string;
  description: string;
}

export function HowItWorksVideoCard({ title, src, description }: Props) {
  return (
    <article style={{ border: '1px solid rgba(138, 92, 255, 0.35)', borderRadius: 14, padding: 12, background: 'rgba(10,14,28,.55)' }}>
      <h4 style={{ color: '#d6e4ff', marginTop: 0 }}>{title}</h4>
      <video muted loop autoPlay playsInline preload="none" controls={false} style={{ width: '100%', borderRadius: 10, background: '#0a0d18' }}>
        <source src={src} type="video/mp4" />
        Your browser does not support embedded video.
      </video>
      <p style={{ color: '#9eb2d9', fontSize: 13, marginBottom: 0 }}>{description}</p>
    </article>
  );
}
