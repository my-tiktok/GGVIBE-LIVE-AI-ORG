"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useFirebaseAuth } from "@/components/auth/auth-provider";
import {
  PayoutRequestDoc,
  SellerDoc,
  getFirebaseFirestore,
} from "@/lib/firebase/firestore";

function nowIso() {
  return new Date().toISOString();
}

function defaultSeller(uid: string): SellerDoc {
  const timestamp = nowIso();
  return {
    uid,
    payoutSettings: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      btcAddress: "",
    },
    flags: {
      isSeller: true,
      isVerified: false,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function validateBtc(address: string) {
  if (!address) {
    return true;
  }

  return address.startsWith("bc1") && address.length >= 14 && address.length <= 90;
}

export default function PayoutsPage() {
  const router = useRouter();
  const { user, loading } = useFirebaseAuth();

  const [seller, setSeller] = useState<SellerDoc | null>(null);
  const [history, setHistory] = useState<PayoutRequestDoc[]>([]);
  const [amountNGN, setAmountNGN] = useState("");
  const [method, setMethod] = useState<"BANK" | "BTC">("BANK");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const btcInvalid = useMemo(() => {
    const btcAddress = seller?.payoutSettings.btcAddress || "";
    return Boolean(btcAddress) && !validateBtc(btcAddress);
  }, [seller]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const bootstrapSeller = async () => {
      setError(null);
      const db = getFirebaseFirestore();
      const ref = doc(db, "sellers", user.uid);
      const snapshot = await getDoc(ref);

      if (!snapshot.exists()) {
        const created = defaultSeller(user.uid);
        await setDoc(ref, created);
        setSeller(created);
      } else {
        setSeller(snapshot.data() as SellerDoc);
      }
    };

    const loadHistory = async () => {
      const db = getFirebaseFirestore();
      const q = query(
        collection(db, "payoutRequests"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      setHistory(snapshot.docs.map((entry) => entry.data() as PayoutRequestDoc));
    };

    void bootstrapSeller().then(loadHistory).catch((err) => {
      console.error("payouts load failed", err);
      setError("Failed to load seller profile");
    });
  }, [user?.uid]);

  const updateField = async (field: keyof SellerDoc["payoutSettings"], value: string) => {
    if (!user?.uid || !seller) {
      return;
    }

    const next: SellerDoc = {
      ...seller,
      payoutSettings: {
        ...seller.payoutSettings,
        [field]: value,
      },
      updatedAt: nowIso(),
    };

    setSeller(next);

    try {
      const db = getFirebaseFirestore();
      await updateDoc(doc(db, "sellers", user.uid), {
        payoutSettings: next.payoutSettings,
        updatedAt: next.updatedAt,
      });
      setStatus("Payout settings saved.");
    } catch (err) {
      console.error("save payout settings failed", err);
      setError("Failed to save payout settings");
    }
  };

  const submitRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!user?.uid || !seller) {
      setError("You must be logged in.");
      return;
    }

    if (method === "BTC" && !validateBtc(seller.payoutSettings.btcAddress)) {
      setError("Invalid wallet address");
      return;
    }

    const parsedAmount = Number(amountNGN);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid payout amount.");
      return;
    }

    const payload: Omit<PayoutRequestDoc, "requestId"> = {
      uid: user.uid,
      amountNGN: parsedAmount,
      method,
      bankSnapshot:
        method === "BANK"
          ? {
              bankName: seller.payoutSettings.bankName,
              accountNumber: seller.payoutSettings.accountNumber,
              accountName: seller.payoutSettings.accountName,
            }
          : undefined,
      btcSnapshot:
        method === "BTC"
          ? {
              btcAddress: seller.payoutSettings.btcAddress,
            }
          : undefined,
      status: "PENDING",
      note: "",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    try {
      const db = getFirebaseFirestore();
      const created = await addDoc(collection(db, "payoutRequests"), payload);
      const finalized: PayoutRequestDoc = {
        ...payload,
        requestId: created.id,
      };
      await updateDoc(created, { requestId: created.id });
      setHistory((prev) => [finalized, ...prev]);
      setAmountNGN("");
      setStatus("Payout request submitted.");
    } catch (err) {
      console.error("payout request failed", err);
      setError("Failed to create payout request.");
    }
  };

  if (loading || !seller) {
    return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading payouts...</main>;
  }

  return (
    <main style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
      <h1>Payouts</h1>
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      {status && <p style={{ color: "#16a34a" }}>{status}</p>}

      <section style={{ marginBottom: 24 }}>
        <h2>Seller payout settings</h2>
        <div style={{ display: "grid", gap: 8 }}>
          <input
            placeholder="Bank name"
            value={seller.payoutSettings.bankName}
            onChange={(event) => updateField("bankName", event.target.value)}
          />
          <input
            placeholder="Account number"
            value={seller.payoutSettings.accountNumber}
            onChange={(event) => updateField("accountNumber", event.target.value)}
          />
          <input
            placeholder="Account name"
            value={seller.payoutSettings.accountName}
            onChange={(event) => updateField("accountName", event.target.value)}
          />
          <input
            placeholder="Bitcoin receive address (bc1...)"
            value={seller.payoutSettings.btcAddress}
            onChange={(event) => updateField("btcAddress", event.target.value.trim())}
          />
          {btcInvalid && <p style={{ color: "#dc2626", margin: 0 }}>Invalid wallet address</p>}
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Request payout</h2>
        <form onSubmit={submitRequest} style={{ display: "grid", gap: 10, maxWidth: 400 }}>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="Amount (NGN)"
            value={amountNGN}
            onChange={(event) => setAmountNGN(event.target.value)}
            required
          />
          <select value={method} onChange={(event) => setMethod(event.target.value as "BANK" | "BTC") }>
            <option value="BANK">BANK</option>
            <option value="BTC">BTC</option>
          </select>
          <button type="submit">Request Payout</button>
        </form>
      </section>

      <section>
        <h2>Payout history</h2>
        {history.length === 0 ? (
          <p>No payout requests yet.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {history.map((item) => (
              <li key={item.requestId}>
                {item.createdAt} — {item.method} — ₦{item.amountNGN.toLocaleString()} — {item.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
