export type ListingType = "PHYSICAL" | "DIGITAL" | "FOOD" | "SERVICE";
export type ListingStatus = "active" | "draft" | "sold" | "paused";

export interface Listing {
  id: string;
  ownerId: string;
  type: ListingType;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  location?: string;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}
