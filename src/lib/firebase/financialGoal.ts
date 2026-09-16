import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "./config";
import { getTransactions } from "./transaction";

export type FinancialGoalStatus = "active" | "completed";

export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | null;
  status: FinancialGoalStatus;
  isActive: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface FinancialGoalWithProgress extends FinancialGoal {
  progress: number;
  remaining: number;
}

const financialGoalsCollection = collection(db, "financialGoals");
const walletsCollection = collection(db, "wallets");
const transactionsCollection = collection(db, "transactions");

export async function getFinancialGoals(
  userId: string,
): Promise<FinancialGoalWithProgress[]> {
  const financialGoalQuery = query(
    financialGoalsCollection,
    where("userId", "==", userId),
    where("isActive", "==", true),
  );

  const snapshot = await getDocs(financialGoalQuery);

  return snapshot.docs.map((document) => {
    const data = document.data();

    const targetAmount = Number(data.targetAmount ?? 0);
    const currentAmount = Number(data.currentAmount ?? 0);

    const progress =
      targetAmount > 0
        ? Math.min((currentAmount / targetAmount) * 100, 100)
        : 0;

    const remaining = Math.max(targetAmount - currentAmount, 0);

    return {
      id: document.id,
      userId: data.userId,
      name: data.name,
      targetAmount,
      currentAmount,
      targetDate:
        data.targetDate instanceof Timestamp
          ? data.targetDate.toDate()
          : data.targetDate ?? null,
      status: data.status ?? "active",
      isActive: data.isActive ?? true,
      createdAt:
        data.createdAt instanceof Timestamp ? data.createdAt : null,
      updatedAt:
        data.updatedAt instanceof Timestamp ? data.updatedAt : null,
      progress,
      remaining,
    };
  });
}

export async function createFinancialGoal(
  userId: string,
  name: string,
  targetAmount: number,
  targetDate: Date | null,
): Promise<string> {
  const docRef = await addDoc(financialGoalsCollection, {
    userId,
    name,
    targetAmount,
    currentAmount: 0,
    targetDate,
    status: "active",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateFinancialGoal(
  userId: string,
  goalId: string,
  data: {
    name?: string;
    targetAmount?: number;
    targetDate?: Date | null;
  },
): Promise<void> {
  const goalRef = doc(financialGoalsCollection, goalId);

  const goalQuery = query(
    financialGoalsCollection,
    where("__name__", "==", goalId),
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(goalQuery);

  if (snapshot.empty) {
    throw new Error("Financial goal tidak ditemukan.");
  }

  await updateDoc(goalRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function archiveFinancialGoal(
  userId: string,
  goalId: string,
): Promise<void> {
  const goalQuery = query(
    financialGoalsCollection,
    where("__name__", "==", goalId),
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(goalQuery);

  if (snapshot.empty) {
    throw new Error("Financial goal tidak ditemukan.");
  }

  // Ambil seluruh transaksi yang terhubung ke financial goal.
  // Transaksi kontribusi menggunakan goalId dan fromWalletId,
  // sehingga ketika transaksi di-soft-delete, saldo wallet
  // otomatis kembali pada saat saldo dihitung dari transaksi aktif.
  const goalTransactionsQuery = query(
    transactionsCollection,
    where("userId", "==", userId),
    where("goalId", "==", goalId),
  );

  const transactionSnapshot = await getDocs(
    goalTransactionsQuery,
  );

  // Satu batch agar penghapusan transaksi kontribusi dan
  // pengarsipan goal tersimpan secara atomik.
  const batch = writeBatch(db);

  for (const transactionDocument of transactionSnapshot.docs) {
    const transactionData = transactionDocument.data();

    // Jangan memproses transaksi yang memang sudah dihapus.
    if (transactionData.isDeleted === true) {
      continue;
    }

    batch.update(transactionDocument.ref, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });
  }

  batch.update(doc(financialGoalsCollection, goalId), {
    isActive: false,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function addGoalContribution(
  userId: string,
  goalId: string,
  walletId: string,
  amount: number,
): Promise<void> {
  if (!walletId) {
    throw new Error("Wallet wajib dipilih.");
  }

  if (!amount || amount <= 0) {
    throw new Error("Nominal kontribusi harus lebih dari 0.");
  }

  // Ambil goal
  const goalQuery = query(
    financialGoalsCollection,
    where("__name__", "==", goalId),
    where("userId", "==", userId),
  );

  const goalSnapshot = await getDocs(goalQuery);

  if (goalSnapshot.empty) {
    throw new Error("Financial goal tidak ditemukan.");
  }

  const goalDocument = goalSnapshot.docs[0];
  const goalData = goalDocument.data();

  const targetAmount = Number(goalData.targetAmount ?? 0);
  const currentAmount = Number(goalData.currentAmount ?? 0);
  const remaining = Math.max(targetAmount - currentAmount, 0);

  if (remaining <= 0) {
    throw new Error("Financial goal sudah mencapai target.");
  }

  if (amount > remaining) {
    throw new Error(
      `Kontribusi melebihi sisa target. Maksimal Rp ${remaining.toLocaleString(
        "id-ID",
      )}.`,
    );
  }

  // Ambil wallet
  const walletQuery = query(
    walletsCollection,
    where("__name__", "==", walletId),
    where("userId", "==", userId),
  );

  const walletSnapshot = await getDocs(walletQuery);

  if (walletSnapshot.empty) {
    throw new Error("Wallet tidak ditemukan.");
  }

  const walletDocument = walletSnapshot.docs[0];
  const walletData = walletDocument.data();

  const initialBalance = Number(walletData.initialBalance ?? 0);

  // Hitung saldo wallet berdasarkan transaksi
  const transactions = await getTransactions(userId);

  let walletBalance = initialBalance;

  for (const transaction of transactions) {
    if (transaction.type === "income") {
      if (transaction.walletId === walletId) {
        walletBalance += transaction.amount;
      }
    }

    if (transaction.type === "expense") {
      if (transaction.walletId === walletId) {
        walletBalance -= transaction.amount;
      }
    }

    if (transaction.type === "transfer") {
      if (transaction.fromWalletId === walletId) {
        walletBalance -= transaction.amount;
      }

      if (transaction.toWalletId === walletId) {
        walletBalance += transaction.amount;
      }
    }
  }

  if (amount > walletBalance) {
    throw new Error(
      `Saldo wallet tidak mencukupi. Saldo tersedia Rp ${walletBalance.toLocaleString(
        "id-ID",
      )}.`,
    );
  }

  const newCurrentAmount = currentAmount + amount;

  const newStatus: FinancialGoalStatus =
    newCurrentAmount >= targetAmount ? "completed" : "active";

  // Atomic batch
  const batch = writeBatch(db);

  // Transaction alokasi goal
  const transactionRef = doc(transactionsCollection);

  batch.set(transactionRef, {
    userId,
    type: "transfer",
    fromWalletId: walletId,
    goalId,
    amount,
    description: `Alokasi ke ${goalData.name}`,
    transactionDate: Timestamp.now(),
    isDeleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update goal
  const goalRef = doc(financialGoalsCollection, goalId);

  batch.update(goalRef, {
    currentAmount: newCurrentAmount,
    status: newStatus,
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
}