export function GlowLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #00e0ff, #8a5cff)',
          boxShadow: '0 0 28px rgba(0,224,255,.55)',
        }}
      />
      <h1 style={{ margin: 0, color: '#e8eeff', letterSpacing: 1, fontWeight: 700 }}>GGVIBE</h1>
    </div>
  );
}
