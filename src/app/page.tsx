"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/config";


export default function Home() {
  const [status, setStatus] = useState("Checking Firebase...");

  useEffect(() => {
    if (auth && db) {
      setStatus("Firebase connected");
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          Monvanta
        </h1>

        <p className="mt-4 text-gray-600">
          {status}
        </p>
      </div>
    </main>
  );
}