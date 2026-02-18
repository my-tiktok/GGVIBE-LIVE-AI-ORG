'use client';

export default function AppError({ reset }: { reset: () => void }) {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#070b17', color: '#ffd6d6', padding: 16 }}>
      <div>
        <h2 style={{ marginTop: 0 }}>Something went wrong in the app area</h2>
        <button onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
