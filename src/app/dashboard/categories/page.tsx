"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

import { useAuthStore } from "@/stores/authStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { Category, CategoryType } from "@/types/category";

export default function CategoriesPage() {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);

  const categories = useCategoryStore((state) => state.categories);
  const loading = useCategoryStore((state) => state.loading);
  const error = useCategoryStore((state) => state.error);

  const loadCategories = useCategoryStore(
    (state) => state.loadCategories,
  );
  const addCategory = useCategoryStore((state) => state.addCategory);
  const editCategory = useCategoryStore(
    (state) => state.editCategory,
  );
  const archiveCategory = useCategoryStore((state) => state.archive);
  const clearError = useCategoryStore((state) => state.clearError);

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [editingCategoryId, setEditingCategoryId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadCategories(user.uid);
    }
  }, [user, loadCategories]);

  const resetForm = () => {
    setName("");
    setType("expense");
    setEditingCategoryId(null);
    clearError();
  };

  const handleEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setName(category.name);
    setType(category.type);
    clearError();
  };

  const handleArchive = async (categoryId: string) => {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin mengarsipkan category ini?",
    );

    if (!confirmed) {
      return;
    }

    clearError();

    try {
      await archiveCategory(categoryId);
    } catch {
      // Error ditangani oleh categoryStore.
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    clearError();

    if (!name.trim()) {
      return;
    }

    try {
      if (editingCategoryId) {
        await editCategory(editingCategoryId, {
          name: name.trim(),
        });
      } else {
        await addCategory(user.uid, name.trim(), type);
      }

      resetForm();
    } catch {
      // Error ditangani oleh categoryStore.
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const incomeCategories = categories.filter(
    (category) => category.type === "income",
  );

  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  const renderCategory = (
    category: Category,
    typeLabel: string,
  ) => (
    <div
      key={category.id}
      className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            category.type === "income"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <span className="text-sm font-bold">
            {category.type === "income" ? "+" : "−"}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900">
            {category.name}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            {typeLabel}
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleEdit(category)}
            className="px-3 py-2 text-xs"
          >
            Edit
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={() => handleArchive(category.id)}
            disabled={loading}
            className="px-3 py-2 text-xs"
          >
            Archive
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCategorySection = (
    title: string,
    count: number,
    items: Category[],
    typeLabel: string,
    emptyMessage: string,
  ) => (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Category aktif
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            typeLabel === "Pemasukan"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {count} category
        </span>
      </div>

      {loading && categories.length === 0 ? (
        <div className="flex min-h-24 items-center justify-center">
          <p className="text-sm text-slate-500">
            Memuat category...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((category) =>
            renderCategory(category, typeLabel),
          )}
        </div>
      )}
    </Card>
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Category
          </h1>

          <p className="mt-2 text-slate-600">
            Kelola category pemasukan dan pengeluaran kamu.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="grid gap-6 md:grid-cols-2">
              {renderCategorySection(
                "Pemasukan",
                incomeCategories.length,
                incomeCategories,
                "Pemasukan",
                "Belum ada category pemasukan.",
              )}

              {renderCategorySection(
                "Pengeluaran",
                expenseCategories.length,
                expenseCategories,
                "Pengeluaran",
                "Belum ada category pengeluaran.",
              )}
            </div>
          </section>

          <section>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingCategoryId
                  ? "Edit Category"
                  : "Tambah Category"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {editingCategoryId
                  ? "Ubah informasi category."
                  : "Buat category baru untuk transaksi."}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <Input
                  label="Nama Category"
                  id="categoryName"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Contoh: Makanan"
                  required
                />

                <Select
                  label="Tipe"
                  id="categoryType"
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value as CategoryType)
                  }
                  disabled={!!editingCategoryId}
                >
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </Select>

                {editingCategoryId && (
                  <p className="text-xs text-slate-400">
                    Tipe category tidak dapat diubah.
                  </p>
                )}

                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  {editingCategoryId && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Batal
                    </Button>
                  )}

                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading
                      ? "Menyimpan..."
                      : editingCategoryId
                        ? "Simpan Perubahan"
                        : "Tambah Category"}
                  </Button>
                </div>
              </form>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
