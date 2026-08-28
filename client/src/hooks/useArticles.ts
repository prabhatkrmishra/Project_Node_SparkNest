import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/API";
import type { ArticlePreview } from "../types/api";

type PaginatedResponse = {
  articles: ArticlePreview[];
  totalPages: number;
};

export const useArticlePreviews = (page: number, limit = 12) =>
  useQuery({
    queryKey: ["previews", page, limit],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>(
        `/article/previews?page=${page}&limit=${limit}`
      );
      return data;
    },
  });

export const useArticlePreviewsCategory = (category: string, page: number, limit = 12) =>
  useQuery({
    queryKey: ["previews", "category", category, page, limit],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>(
        `/article/preview/category/${category}?page=${page}&limit=${limit}`
      );
      return data;
    },
    enabled: !!category,
  });

export const useProfilePreviews = (userId: string | number, page: number, limit = 12) =>
  useQuery({
    queryKey: ["previews", "profile", userId, page, limit],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse>(
        `/article/profile/preview/${userId}?page=${page}&limit=${limit}`
      );
      return data;
    },
    enabled: !!userId,
  });

export const useCreateArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.post("/article/create", formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["previews"] }),
  });
};

export const useUpdateArticle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.patch("/article/update", formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["previews"] }),
  });
};
