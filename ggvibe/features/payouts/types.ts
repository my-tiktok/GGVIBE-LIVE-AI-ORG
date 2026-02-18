export type PayoutMethod = "BANK_NGN" | "CRYPTO_BTC";

export interface PayoutPreference {
  uid: string;
  method: PayoutMethod;
  bank?: {
    name: string;
    accountNumber: string;
    accountName: string;
  };
  crypto?: {
    btcAddress: string;
  };
  createdAt: string;
  updatedAt: string;
}
