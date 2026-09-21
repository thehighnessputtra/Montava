"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { signUp } from "@/lib/api/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      await signUp({
        name,
        email,
        password,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error(error);

      setMessage(
        "Registrasi gagal. Silakan periksa kembali data kamu.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-xl border p-6 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-bold">
            Buat Akun
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Mulai kelola keuanganmu dengan Monvanta.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Nama
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
            className="w-full rounded-lg border p-2.5"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full rounded-lg border p-2.5"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="w-full rounded-lg border p-2.5"
            minLength={8}
            required
          />
        </div>

        {message && (
          <p className="text-sm text-red-500">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black p-2.5 text-white disabled:opacity-50"
        >
          {loading ? "Mendaftarkan..." : "Daftar"}
        </button>
      </form>
    </main>
  );
}