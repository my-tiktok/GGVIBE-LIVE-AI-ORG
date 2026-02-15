export function HowItWorksVideoCard() {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,.2)" }}>
      <video autoPlay loop muted playsInline preload="none" poster="/videos/how-send.mp4" style={{ width: "100%", maxHeight: 220, objectFit: "cover", background: "#090611" }}>
        <source src="/videos/how-send.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
