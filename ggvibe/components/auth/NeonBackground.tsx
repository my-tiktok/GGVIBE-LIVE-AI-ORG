export function NeonBackground() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, background: "radial-gradient(circle at 20% 20%, rgba(255,46,159,.25), transparent 30%), radial-gradient(circle at 80% 0%, rgba(0,245,255,.2), transparent 35%), linear-gradient(160deg,#06020f 0%,#0d0b1f 55%,#06020f 100%)", zIndex: -2 }}>
      <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(1px)" }} />
    </div>
  );
}
