import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as newsService from '../services/newsService';
import type { NewsArticle } from '../types';
import NewsCard from '../components/NewsCard';

type CopyState = 'idle' | 'success' | 'error';

// Safe array helper to prevent .map() crashes
const safeArray = <T,>(value: unknown, fallback: T[] = []): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string' && value.trim()) {
    // Handle comma-separated strings (like tags)
    return value.split(',').map(s => s.trim()).filter(Boolean) as T[];
  }
  return fallback;
};

const extractArticle = (payload: unknown): NewsArticle | null => {
  if (!payload) return null;
  const candidate = payload as any;
  if (candidate.article) return candidate.article as NewsArticle;
  if (candidate.data?.article) return candidate.data.article as NewsArticle;
  if (candidate.data && !Array.isArray(candidate.data)) return candidate.data as NewsArticle;
  if (candidate.data && Array.isArray(candidate.data)) return candidate.data[0] as NewsArticle | undefined || null;
  return candidate as NewsArticle;
};

const extractArticles = (payload: unknown): NewsArticle[] => {
  if (!payload) return [];
  const candidate = payload as any;
  if (Array.isArray(candidate)) return candidate as NewsArticle[];
  if (Array.isArray(candidate.data)) return candidate.data as NewsArticle[];
  if (Array.isArray(candidate.items)) return candidate.items as NewsArticle[];
  if (Array.isArray(candidate.articles)) return candidate.articles as NewsArticle[];
  return [];
};

const NewsArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      setError('not-found');
      return;
    }
    let isActive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const response = await newsService.getArticleBySlug(slug);
        if (!isActive) return;
        const resolved = extractArticle(response);
        if (!resolved) {
          setError('not-found');
          setArticle(null);
          return;
        }
        setArticle(resolved);
      } catch (err: any) {
        if (!isActive) return;
        const status = err?.response?.status;
        setError(status === 404 ? 'not-found' : 'failed');
        setArticle(null);
      } finally {
        if (isActive) setLoading(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!article) {
      setRelatedArticles([]);
      return;
    }
    let isActive = true;
    setRelatedLoading(true);
    (async () => {
      try {
        const response = await newsService.getArticles({ page: 1, limit: 5, category: article.category });
        if (!isActive) return;
        const articles = extractArticles(response)
          .filter((item) => item.slug !== article.slug)
          .slice(0, 4);
        setRelatedArticles(articles);
      } catch {
        if (!isActive) return;
        setRelatedArticles([]);
      } finally {
        if (isActive) setRelatedLoading(false);
      }
    })();
    return () => {
      isActive = false;
    };
  }, [article]);

  useEffect(() => {
    if (!article) return;
    const previousTitle = document.title;
    const metaTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = metaTag?.getAttribute('content') ?? '';
    let descriptionMeta = metaTag;
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
    }
    document.title = `${article.title} | Traycer.AI News`;
    descriptionMeta.setAttribute('content', article.summary || article.title);
    const createdMeta = !metaTag;
    return () => {
      document.title = previousTitle;
      if (descriptionMeta) {
        if (createdMeta) {
          descriptionMeta.remove();
        } else {
          descriptionMeta.setAttribute('content', previousDescription);
        }
      }
    };
  }, [article]);

  const readingTime = useMemo(() => {
    if (!article?.content) return null;
    const text = article.content.replace(/<[^>]+>/g, ' ');
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [article?.content]);

  const formattedContent = useMemo(() => {
    if (!article?.content) return '';
    const content = article.content.trim();
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return content;
    }
    return content
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
      .join('');
  }, [article?.content]);

  const formattedDate = useMemo(() => {
    if (!article?.publishedAt) return '';
    const date = new Date(article.publishedAt);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }, [article?.publishedAt]);

  const handleShare = async (platform: 'twitter' | 'linkedin' | 'copy') => {
    if (!article) return;
    const url = window.location.href;
    const text = `${article.title} — via Traycer.AI`;
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setCopyState('success');
      } catch {
        setCopyState('error');
      } finally {
        if (copyTimeoutRef.current) {
          clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => setCopyState('idle'), 2200);
      }
      return;
    }
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 lg:px-0 py-16">
        <div className="space-y-8 animate-pulse">
          <div className="h-64 bg-dark-secondary/60 rounded-3xl" />
          <div className="h-12 bg-dark-secondary/60 rounded-xl w-3/4" />
          <div className="h-6 bg-dark-secondary/50 rounded-lg w-1/3" />
          <div className="space-y-4">
            <div className="h-4 bg-dark-secondary/40 rounded w-full" />
            <div className="h-4 bg-dark-secondary/40 rounded w-5/6" />
            <div className="h-4 bg-dark-secondary/40 rounded w-2/3" />
            <div className="h-4 bg-dark-secondary/40 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error === 'not-found') {
    return (
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-20 text-center">
        <h1 className="text-4xl font-bold text-light-primary">Article Not Found</h1>
        <p className="mt-6 text-light-secondary">
          We couldn&apos;t find the news story you were looking for. It may have been removed or is temporarily unavailable.
        </p>
        <Link
          to="/news"
          className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition"
        >
          Browse AI News
        </Link>
      </div>
    );
  }

  if (error === 'failed') {
    return (
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-20 text-center">
        <h1 className="text-3xl font-bold text-light-primary">Something went wrong</h1>
        <p className="mt-6 text-light-secondary">
          We had trouble loading this article. Please try again or visit the news hub for other updates.
        </p>
        <Link
          to="/news"
          className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition"
        >
          Visit AI News Hub
        </Link>
      </div>
    );
  }

  if (!article) {
    return null;
    }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-0 py-12 lg:py-16">
      <nav className="text-sm text-light-tertiary flex flex-wrap items-center gap-2 mb-8">
        <Link to="/news" className="hover:text-brand-primary transition">
          News
        </Link>
        <span>/</span>
        <Link
          to={`/news?category=${encodeURIComponent(article.category)}`}
          className="hover:text-brand-primary transition"
        >
          {article.category}
        </Link>
        <span>/</span>
        <span className="text-light-secondary truncate">{article.title}</span>
      </nav>

      {article.imageUrl ? (
        <div className="w-full overflow-hidden rounded-3xl border border-border-dark shadow-xl mb-8">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover max-h-[420px]"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full h-64 rounded-3xl border border-border-dark shadow-inner mb-8 bg-gradient-to-tr from-brand-primary/40 via-indigo-500/30 to-violet-500/30 flex items-center justify-center">
          <span className="text-4xl">📰</span>
        </div>
      )}

      <header className="space-y-6 mb-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold uppercase tracking-wide">
            {article.category}
          </span>
          {safeArray<string>(article.tags).slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-dark-secondary text-light-tertiary text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-light-primary leading-tight">{article.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-light-tertiary">
          {formattedDate && (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-primary" />
              {formattedDate}
            </span>
          )}
          {readingTime && (
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-primary" />
              {readingTime} min read
            </span>
          )}
          {article.source && (
            <a
              href={article.sourceUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-brand-primary transition"
            >
              <span className="w-2 h-2 rounded-full bg-brand-primary" />
              Source: {article.source}
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={article.sourceUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition shadow-lg"
          >
            Read Original Article
          </a>
          <button
            type="button"
            onClick={() => handleShare('copy')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition ${
              copyState === 'success'
                ? 'border-emerald-500 text-emerald-400'
                : copyState === 'error'
                ? 'border-red-500 text-red-400'
                : 'border-border-dark text-light-secondary hover:text-light-primary hover:border-brand-primary'
            }`}
          >
            <span>🔗</span>
            {copyState === 'success' ? 'Link Copied!' : copyState === 'error' ? 'Copy Failed' : 'Copy Link'}
          </button>
        </div>
      </header>

      {article.summary && (
        <p className="text-lg text-light-secondary bg-dark-secondary/40 border border-border-dark px-6 py-5 rounded-2xl mb-10 leading-relaxed">
          {article.summary}
        </p>
      )}

      <article
        className="prose prose-lg prose-invert max-w-none prose-headings:text-light-primary prose-headings:font-bold prose-p:text-light-secondary prose-a:text-brand-primary prose-strong:text-light-primary prose-code:text-brand-primary/90 prose-pre:bg-dark-secondary/60 prose-pre:border prose-pre:border-border-dark prose-pre:rounded-xl prose-img:rounded-2xl prose-img:border prose-img:border-border-dark mb-16"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-border-dark pt-6 mb-16">
        <div>
          <p className="text-sm text-light-tertiary">Enjoyed this story?</p>
          <p className="text-base text-light-secondary">
            Discover more insights and the latest AI breakthroughs on our news hub.
          </p>
        </div>
        <Link
          to="/news"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-primary/90 transition"
        >
          ← Back to AI News
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-light-primary">Related Articles</h2>
          <Link to="/news" className="text-sm font-semibold text-brand-primary hover:underline">
            View all news
          </Link>
        </div>
        {relatedLoading ? (
          <div className="grid gap-6 md:grid-cols-2 animate-pulse">
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="h-48 rounded-2xl border border-border-dark bg-dark-secondary/50" />
            ))}
          </div>
        ) : relatedArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {relatedArticles.map((related) => (
              <NewsCard key={related.id} article={related} />
            ))}
          </div>
        ) : (
          <div className="border border-border-dark rounded-2xl px-6 py-8 text-center text-light-tertiary bg-dark-secondary/40">
            No related stories yet. Check back soon for more AI updates in this category.
          </div>
        )}
      </section>
    </div>
  );
};

export default NewsArticlePage;
