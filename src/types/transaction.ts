import { Timestamp } from "firebase/firestore";

export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;

  walletId?: string;
  categoryId?: string;
  fromWalletId?: string;
  toWalletId?: string;

  // Financial Goal allocation
  goalId?: string;

  amount: number;
  description: string;
  transactionDate: Timestamp;

  isDeleted: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}