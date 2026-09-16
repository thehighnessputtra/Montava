import { Timestamp } from "firebase/firestore";

export interface Wallet {
  id: string;
  userId: string;

  name: string;
  description: string;

  initialBalance: number;
  currency: string;

  isActive: boolean;

  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}