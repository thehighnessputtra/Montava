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
import { Wallet } from "@/types/wallet";

const walletsCollection = collection(db, "wallets");

export async function getWallets(userId: string): Promise<Wallet[]> {
  const walletQuery = query(
    walletsCollection,
    where("userId", "==", userId),
    where("isActive", "==", true)
  );

  const snapshot = await getDocs(walletQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Wallet[];
}

export async function createWallet(
  userId: string,
  name: string,
  description: string,
  initialBalance: number,
  currency: string = "IDR"
): Promise<string> {
  const walletData = {
    userId,
    name,
    description,
    initialBalance,
    currency,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const document = await addDoc(walletsCollection, walletData);

  return document.id;
}

export async function updateWallet(
  walletId: string,
  data: {
    name?: string;
    description?: string;
    initialBalance?: number;
  }
): Promise<void> {
  await updateDoc(doc(db, "wallets", walletId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function archiveWallet(
  walletId: string
): Promise<void> {
  await updateDoc(doc(db, "wallets", walletId), {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}