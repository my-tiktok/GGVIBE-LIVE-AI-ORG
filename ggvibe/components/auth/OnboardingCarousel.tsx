const slides = ["Create clips in seconds", "Share instantly", "Earn with engagement"];

export function OnboardingCarousel() {
  return (
    <ul style={{ margin: 0, paddingLeft: 18, color: "#d6e6ff", display: "grid", gap: 8 }}>
      {slides.map((s) => (
        <li key={s}>{s}</li>
      ))}
    </ul>
  );
}
