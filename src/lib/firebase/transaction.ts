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
import {
  Transaction,
  TransactionType,
} from "@/types/transaction";

const transactionsCollection = collection(
  db,
  "transactions",
);

export async function getTransactions(
  userId: string,
): Promise<Transaction[]> {
  const transactionQuery = query(
    transactionsCollection,
    where("userId", "==", userId),
  );

  const snapshot =
    await getDocs(transactionQuery);

  const transactions =
    snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })) as Transaction[];

  return transactions.filter(
    (transaction) =>
      transaction.isDeleted !== true,
  );
}

// ==========================================
// INCOME
// ==========================================

export async function createIncome(
  userId: string,
  walletId: string,
  categoryId: string,
  amount: number,
  description: string,
  transactionDate: Date,
): Promise<string> {
  return createTransaction({
    userId,
    type: "income",
    walletId,
    categoryId,
    amount,
    description,
    transactionDate,
  });
}

// ==========================================
// EXPENSE
// ==========================================

export async function createExpense(
  userId: string,
  walletId: string,
  categoryId: string,
  amount: number,
  description: string,
  transactionDate: Date,
): Promise<string> {
  return createTransaction({
    userId,
    type: "expense",
    walletId,
    categoryId,
    amount,
    description,
    transactionDate,
  });
}

// ==========================================
// TRANSFER WALLET → WALLET
// ==========================================

export async function createTransfer(
  userId: string,
  fromWalletId: string,
  toWalletId: string,
  amount: number,
  description: string,
  transactionDate: Date,
): Promise<string> {
  if (
    fromWalletId === toWalletId
  ) {
    throw new Error(
      "Wallet asal dan tujuan harus berbeda.",
    );
  }

  return createTransaction({
    userId,
    type: "transfer",
    fromWalletId,
    toWalletId,
    amount,
    description,
    transactionDate,
  });
}

// ==========================================
// TRANSFER WALLET → FINANCIAL GOAL
// ==========================================

export async function createGoalTransfer(
  userId: string,
  fromWalletId: string,
  goalId: string,
  amount: number,
  description: string,
  transactionDate: Date,
): Promise<string> {
  if (!fromWalletId) {
    throw new Error(
      "Wallet sumber wajib dipilih.",
    );
  }

  if (!goalId) {
    throw new Error(
      "Financial goal wajib dipilih.",
    );
  }

  if (amount <= 0) {
    throw new Error(
      "Jumlah transaksi harus lebih dari 0.",
    );
  }

  return createTransaction({
    userId,
    type: "transfer",
    fromWalletId,
    goalId,
    amount,
    description,
    transactionDate,
  });
}

// ==========================================
// CREATE TRANSACTION
// ==========================================

async function createTransaction(data: {
  userId: string;
  type: TransactionType;

  walletId?: string;
  categoryId?: string;

  fromWalletId?: string;
  toWalletId?: string;

  goalId?: string;

  amount: number;
  description: string;
  transactionDate: Date;
}): Promise<string> {
  if (data.amount <= 0) {
    throw new Error(
      "Jumlah transaksi harus lebih dari 0.",
    );
  }

  const document =
    await addDoc(
      transactionsCollection,
      {
        ...data,

        transactionDate:
          data.transactionDate,

        isDeleted: false,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    );

  return document.id;
}

// ==========================================
// UPDATE TRANSACTION
// ==========================================

export async function updateTransaction(
  transactionId: string,
  data: {
    amount?: number;
    description?: string;

    walletId?: string;
    categoryId?: string;

    fromWalletId?: string;
    toWalletId?: string;

    goalId?: string;

    transactionDate?: Date;
  },
): Promise<void> {
  if (
    data.amount !== undefined &&
    data.amount <= 0
  ) {
    throw new Error(
      "Jumlah transaksi harus lebih dari 0.",
    );
  }

  if (
    data.fromWalletId !==
      undefined &&
    data.toWalletId !==
      undefined &&
    data.fromWalletId ===
      data.toWalletId
  ) {
    throw new Error(
      "Wallet asal dan tujuan harus berbeda.",
    );
  }

  await updateDoc(
    doc(
      db,
      "transactions",
      transactionId,
    ),
    {
      ...data,
      updatedAt:
        serverTimestamp(),
    },
  );
}

// ==========================================
// DELETE TRANSACTION
// ==========================================

export async function deleteTransaction(
  transactionId: string,
): Promise<void> {
  await updateDoc(
    doc(
      db,
      "transactions",
      transactionId,
    ),
    {
      isDeleted: true,
      updatedAt:
        serverTimestamp(),
    },
  );
}