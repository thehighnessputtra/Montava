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
import { Category, CategoryType } from "@/types/category";

const categoriesCollection = collection(db, "categories");

export async function getCategories(
  userId: string
): Promise<Category[]> {
  const categoryQuery = query(
    categoriesCollection,
    where("userId", "==", userId),
    where("isActive", "==", true)
  );

  const snapshot = await getDocs(categoryQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  })) as Category[];
}

export async function createCategory(
  userId: string,
  name: string,
  type: CategoryType
): Promise<string> {
  if (!name.trim()) {
    throw new Error("Nama category wajib diisi.");
  }

  const categoryData = {
    userId,
    name: name.trim(),
    type,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const document = await addDoc(
    categoriesCollection,
    categoryData
  );

  return document.id;
}

export async function updateCategory(
  categoryId: string,
  data: {
    name?: string;
  }
): Promise<void> {
  if (data.name !== undefined && !data.name.trim()) {
    throw new Error("Nama category wajib diisi.");
  }

  await updateDoc(doc(db, "categories", categoryId), {
    ...data,
    ...(data.name !== undefined && {
      name: data.name.trim(),
    }),
    updatedAt: serverTimestamp(),
  });
}

export async function archiveCategory(
  categoryId: string
): Promise<void> {
  await updateDoc(doc(db, "categories", categoryId), {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}