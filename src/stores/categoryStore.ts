"use client";

import { create } from "zustand";

import {
  archiveCategory,
  createCategory,
  getCategories,
  updateCategory,
} from "@/lib/firebase/category";

import { Category, CategoryType } from "@/types/category";

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;

  loadCategories: (userId: string) => Promise<void>;

  addCategory: (
    userId: string,
    name: string,
    type: CategoryType
  ) => Promise<void>;

  editCategory: (
    categoryId: string,
    data: {
      name?: string;
    }
  ) => Promise<void>;

  archive: (categoryId: string) => Promise<void>;

  clearError: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  loadCategories: async (userId) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const categories = await getCategories(userId);

      set({
        categories,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load categories:", error);

      set({
        loading: false,
        error: "Gagal mengambil data category.",
      });
    }
  },

  addCategory: async (userId, name, type) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await createCategory(userId, name, type);

      const categories = await getCategories(userId);

      set({
        categories,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to create category:", error);

      set({
        loading: false,
        error: "Gagal membuat category.",
      });

      throw error;
    }
  },

  editCategory: async (categoryId, data) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await updateCategory(categoryId, data);

      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === categoryId
            ? {
                ...category,
                ...data,
              }
            : category
        ),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to update category:", error);

      set({
        loading: false,
        error: "Gagal mengubah category.",
      });

      throw error;
    }
  },

  archive: async (categoryId) => {
    set({
      loading: true,
      error: null,
    });

    try {
      await archiveCategory(categoryId);

      set((state) => ({
        categories: state.categories.filter(
          (category) => category.id !== categoryId
        ),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to archive category:", error);

      set({
        loading: false,
        error: "Gagal mengarsipkan category.",
      });

      throw error;
    }
  },

  clearError: () => {
    set({
      error: null,
    });
  },
}));