import { Timestamp } from "firebase/firestore";

export type CategoryType = "income" | "expense";

export interface Category {
  id: string;
  userId: string;

  name: string;
  type: CategoryType;

  isActive: boolean;

  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}