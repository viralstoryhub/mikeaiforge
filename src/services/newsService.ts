import api from './api';
import { NewsArticle, PaginatedResponse } from '../types';

interface GetArticlesParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  sortBy?: string;
  timeframe?: string;
}

// Helper to extract data from the backend response format: { status: 'success', data: {...} }
const extractData = <T>(response: any): T => {
  if (response?.data?.data) {
    return response.data.data;
  }
  if (response?.data) {
    return response.data;
  }
  return response;
};

export const getArticles = async (params: GetArticlesParams = {}): Promise<PaginatedResponse<NewsArticle> | NewsArticle[]> => {
  try {
    const response = await api.get('/news', { params });
    return extractData(response);
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

export const getFeaturedArticles = async (): Promise<NewsArticle[]> => {
  try {
    const response = await api.get('/news/featured');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    throw error;
  }
};

export const getArticleBySlug = async (slug: string): Promise<NewsArticle | null> => {
  try {
    const response = await api.get(`/news/${slug}`);
    return extractData(response);
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    throw error;
  }
};

export const getCategories = async (): Promise<any> => {
  try {
    const response = await api.get('/news/categories');
    return extractData(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export default {
  getArticles,
  getFeaturedArticles,
  getArticleBySlug,
  getCategories,
};