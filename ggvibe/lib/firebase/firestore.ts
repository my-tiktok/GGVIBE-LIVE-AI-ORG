import { getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase/client";

export function getFirebaseFirestore() {
  return getFirestore(getFirebaseApp());
}

export type SellerDoc = {
  uid: string;
  payoutSettings: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    btcAddress: string;
  };
  flags: {
    isSeller: boolean;
    isVerified: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type PayoutRequestDoc = {
  requestId: string;
  uid: string;
  amountNGN: number;
  method: "BANK" | "BTC";
  bankSnapshot?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  btcSnapshot?: {
    btcAddress: string;
  };
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  note: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  adminUid?: string;
};

export type ListingDoc = {
  listingId: string;
  uid: string;
  title: string;
  description: string;
  priceNGN: number;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};
