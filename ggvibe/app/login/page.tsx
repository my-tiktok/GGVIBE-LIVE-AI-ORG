"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { GlowLogo } from "@/components/auth/GlowLogo";
import { HowItWorksVideoCard } from "@/components/auth/HowItWorksVideoCard";
import { MagicLinkButton } from "@/components/auth/MagicLinkButton";
import { NeonBackground } from "@/components/auth/NeonBackground";
import { OnboardingCarousel } from "@/components/auth/OnboardingCarousel";
import { PhoneOtpPanel } from "@/components/auth/PhoneOtpPanel";
import { ProviderButtons } from "@/components/auth/ProviderButtons";
import { SocialProofBar } from "@/components/auth/SocialProofBar";

function LoginContent() {
  const searchParams = useSearchParams();
  const variant = (searchParams.get("variant") || "A").toUpperCase();

  const isB = variant === "B";
  const isC = variant === "C";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <NeonBackground />
      <AuthCard>
        <GlowLogo />
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: isC ? "1fr" : "1fr 1fr" }}>
          <div style={{ display: "grid", gap: 12 }}>
            <ProviderButtons />
            <MagicLinkButton />
            <PhoneOtpPanel />
          </div>
          {!isC ? (
            <div style={{ display: "grid", gap: 12 }}>
              <HowItWorksVideoCard />
              <OnboardingCarousel />
              <SocialProofBar />
            </div>
          ) : null}
        </div>
        {isB ? (
          <p style={{ color: "#9ee6ff", marginTop: 12 }}>
            Variant B enabled for compact conversion-focused layout.
          </p>
        ) : null}
      </AuthCard>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ color: "white", padding: 20 }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
