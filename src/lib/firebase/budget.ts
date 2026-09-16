import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./config";
import { getCategories } from "./category";
import { getTransactions } from "./transaction";

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  year: number;
  month: number;
  amount: number;
  isActive: boolean;
  createdAt: ReturnType<typeof serverTimestamp> | null;
  updatedAt: ReturnType<typeof serverTimestamp> | null;
}

export interface BudgetWithUsage extends Budget {
  categoryName: string;
  used: number;
  remaining: number;
  percentage: number;
}

const budgetsCollection = collection(db, "budgets");

export async function getBudgets(
  userId: string,
  year: number,
  month: number,
): Promise<BudgetWithUsage[]> {
  const [budgetSnapshot, categories, transactions] = await Promise.all([
    getDocs(
      query(
        budgetsCollection,
        where("userId", "==", userId),
        where("year", "==", year),
        where("month", "==", month),
        where("isActive", "==", true),
      ),
    ),
    getCategories(userId),
    getTransactions(userId),
  ]);

  const budgets = budgetSnapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Budget[];

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);

  return budgets
    .map((budget) => {
      const used = transactions
        .filter((transaction) => {
          if (
            transaction.type !== "expense" ||
            transaction.categoryId !== budget.categoryId
          ) {
            return false;
          }

          const date = transaction.transactionDate.toDate();

          return date >= startDate && date < endDate;
        })
        .reduce((total, transaction) => total + transaction.amount, 0);

      return {
        ...budget,
        categoryName:
          categories.find((category) => category.id === budget.categoryId)
            ?.name ?? "Category lain",
        used,
        remaining: budget.amount - used,
        percentage:
          budget.amount > 0 ? (used / budget.amount) * 100 : 0,
      };
    })
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
}

export async function createBudget(
  userId: string,
  categoryId: string,
  year: number,
  month: number,
  amount: number,
): Promise<string> {
  if (amount <= 0) {
    throw new Error("Limit budget harus lebih dari 0.");
  }

  const existingQuery = query(
    budgetsCollection,
    where("userId", "==", userId),
    where("categoryId", "==", categoryId),
    where("year", "==", year),
    where("month", "==", month),
    where("isActive", "==", true),
  );

  const existing = await getDocs(existingQuery);

  if (!existing.empty) {
    throw new Error("Budget untuk category dan periode ini sudah ada.");
  }

  const document = await addDoc(budgetsCollection, {
    userId,
    categoryId,
    year,
    month,
    amount,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return document.id;
}

export async function updateBudget(
  budgetId: string,
  amount: number,
): Promise<void> {
  if (amount <= 0) {
    throw new Error("Limit budget harus lebih dari 0.");
  }

  await updateDoc(doc(db, "budgets", budgetId), {
    amount,
    updatedAt: serverTimestamp(),
  });
}

export async function archiveBudget(
  budgetId: string,
): Promise<void> {
  await updateDoc(doc(db, "budgets", budgetId), {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}
