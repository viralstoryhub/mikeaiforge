import { apiClient } from './apiClient';
import type { NewsArticle, PaginationParams } from '../types';

type ApiResponse<T> = {
  data: T;
  message?: string;
};

export interface PaginatedNewsArticles {
  items: NewsArticle[];
  pagination: PaginationParams;
}

export interface NewsCategorySummary {
  name: string;
  slug: string;
  count: number;
}

export interface CreateNewsArticleInput {
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  source: string;
  sourceUrl: string;
  category: string;
  tags?: string[];
  publishedAt?: string | Date;
  isFeatured?: boolean;
}

export type UpdateNewsArticleInput = Partial<CreateNewsArticleInput>;

const sanitizeArticlePayload = (
  payload: CreateNewsArticleInput | UpdateNewsArticleInput
): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === 'tags' && Array.isArray(value)) {
      const filteredTags = value.map(tag => tag.trim()).filter(Boolean);
      if (filteredTags.length > 0) {
        sanitized.tags = filteredTags;
      }
      return;
    }

    if (key === 'publishedAt') {
      if (value instanceof Date) {
        sanitized.publishedAt = value.toISOString();
      } else if (typeof value === 'string' && value.trim()) {
        sanitized.publishedAt = value;
      }
      return;
    }

    sanitized[key] = value;
  });

  return sanitized;
};

const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const maybeAxiosError = error as {
      response?: { data?: { message?: string; error?: string } };
      message?: string;
    };

    const responseMessage =
      maybeAxiosError.response?.data?.message ?? maybeAxiosError.response?.data?.error;

    if (responseMessage) {
      return responseMessage;
    }

    if (typeof maybeAxiosError.message === 'string') {
      return maybeAxiosError.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'An unexpected error occurred while communicating with the news service.';
};

const handleApiError = (error: unknown): never => {
  throw new Error(extractErrorMessage(error));
};

export const getArticles = async ({
  page = 1,
  limit = 12,
  category,
  search,
  featured,
  sortBy,
  timeframe,
}: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  sortBy?: string;
  timeframe?: string;
}) => {
  try {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (featured !== undefined) params.append('featured', String(featured));
    if (sortBy) params.append('sortBy', sortBy);
    if (timeframe) params.append('timeframe', timeframe);

    const response = await apiClient.get<ApiResponse<PaginatedNewsArticles>>(
      `/news?${params.toString()}`
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getFeaturedArticles = async (): Promise<NewsArticle[]> => {
  try {
    const response = await apiClient.get<ApiResponse<NewsArticle[]>>('/news/featured');
    return response.data?.data ?? [];
  } catch (error) {
    handleApiError(error);
  }
};

export const getArticleBySlug = async (slug: string): Promise<NewsArticle> => {
  try {
    const response = await apiClient.get<ApiResponse<NewsArticle>>(
      `/news/${encodeURIComponent(slug)}`
    );

    const article = response.data?.data;
    if (!article) {
      throw new Error('Article not found.');
    }

    return article;
  } catch (error) {
    handleApiError(error);
  }
};

export const getCategories = async (): Promise<NewsCategorySummary[]> => {
  try {
    const response = await apiClient.get<ApiResponse<NewsCategorySummary[]>>('/news/categories');
    return response.data?.data ?? [];
  } catch (error) {
    handleApiError(error);
  }
};

export const createArticle = async (
  data: CreateNewsArticleInput
): Promise<NewsArticle> => {
  try {
    const payload = sanitizeArticlePayload(data);
    const response = await apiClient.post<ApiResponse<NewsArticle>>('/news', payload);

    const article = response.data?.data;
    if (!article) {
      throw new Error('Failed to create article.');
    }

    return article;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateArticle = async (
  articleId: string,
  data: UpdateNewsArticleInput
): Promise<NewsArticle> => {
  try {
    const payload = sanitizeArticlePayload(data);
    const response = await apiClient.patch<ApiResponse<NewsArticle>>(
      `/news/${encodeURIComponent(articleId)}`,
      payload
    );

    const article = response.data?.data;
    if (!article) {
      throw new Error('Failed to update article.');
    }

    return article;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteArticle = async (articleId: string): Promise<void> => {
  try {
    await apiClient.delete(`/news/${encodeURIComponent(articleId)}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const toggleFeatured = async (articleId: string): Promise<NewsArticle> => {
  try {
    const response = await apiClient.patch<ApiResponse<NewsArticle>>(
      `/news/${encodeURIComponent(articleId)}/featured`
    );

    const article = response.data?.data;
    if (!article) {
      throw new Error('Failed to toggle featured status.');
    }

    return article;
  } catch (error) {
    handleApiError(error);
  }
};

export const newsService = {
  getArticles,
  getFeaturedArticles,
  getArticleBySlug,
  getCategories,
  createArticle,
  updateArticle,
  deleteArticle,
  toggleFeatured,
};

export default newsService;