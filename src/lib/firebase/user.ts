import {
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "./config";

export async function createUserProfile(
  uid: string,
  name: string,
  email: string
) {
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}