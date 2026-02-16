export function NeonBackground() {
  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'rgba(0, 224, 255, 0.35)', filter: 'blur(80px)', top: -80, left: -80 }} />
      <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'rgba(175, 82, 255, 0.35)', filter: 'blur(90px)', right: -100, top: 120 }} />
      <div style={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'rgba(18, 255, 170, 0.25)', filter: 'blur(100px)', left: '30%', bottom: -100 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top, #10172a 0%, #05070f 65%)' }} />
    </div>
  );
}
