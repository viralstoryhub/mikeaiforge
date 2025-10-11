
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import ToolCard from '../components/ToolCard';
import { ToolCardSkeleton } from '../components/Skeletons';
import forumService from '../services/forumService';
import newsService from '../services/newsService';
import Seo from '../components/Seo';
import Testimonials from '../components/Testimonials';
type ForumCategoryPreview = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type ForumThreadPreview = {
  id: string;
  title: string;
  slug?: string;
  replyCount?: number;
  author?: {
    id?: string;
    name?: string;
    avatarUrl?: string | null;
  };
  category?: {
    id?: string;
    name?: string;
    slug?: string;
  };
  lastActivityAt?: string;
  createdAt?: string;
};

type NewsArticlePreview = {
  id: string;
  title: string;
  slug?: string;
  summary?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  publishedAt?: string;
  source?: string | null;
};

const COLLECTION_KEYS = ['items', 'data', 'results', 'threads', 'list', 'records', 'rows', 'nodes'] as const;

const extractCollection = <T,>(payload: unknown): T[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (typeof payload === 'object') {
    for (const key of COLLECTION_KEYS) {
      const value = (payload as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        return value as T[];
      }

      if (value && typeof value === 'object') {
        const nested = extractCollection<T>(value);
        if (nested.length) {
          return nested;
        }
      }
    }
  }

  return [];
};

const ForumThreadSkeleton: React.FC = () => (
  <div className="bg-dark-secondary border border-border-dark rounded-xl p-6 animate-pulse">
    <div className="h-5 w-3/4 bg-white/10 rounded" />
    <div className="mt-4 h-4 w-1/2 bg-white/5 rounded" />
    <div className="mt-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white/10" />
      <div className="space-y-2 flex-1">
        <div className="h-4 w-1/3 bg-white/10 rounded" />
        <div className="h-3 w-1/2 bg-white/5 rounded" />
      </div>
    </div>
  </div>
);

const NewsCardSkeleton: React.FC = () => (
  <div className="bg-dark-secondary border border-border-dark rounded-xl overflow-hidden animate-pulse">
    <div className="h-40 bg-white/5" />
    <div className="p-6 space-y-3">
      <div className="h-4 w-1/4 bg-white/10 rounded" />
      <div className="h-6 w-3/4 bg-white/10 rounded" />
      <div className="h-4 w-full bg-white/5 rounded" />
      <div className="h-4 w-2/3 bg-white/5 rounded" />
    </div>
  </div>
);

const HomePage: React.FC = () => {
  const { tools, loading } = useData();
  const [forumThreads, setForumThreads] = useState<ForumThreadPreview[]>([]);
  const [forumLoading, setForumLoading] = useState(true);
  const [forumError, setForumError] = useState<string | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticlePreview[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchForumPreview = async () => {
      try {
        const categoriesResponse = await forumService.getCategories();
        const categories = extractCollection<ForumCategoryPreview>(categoriesResponse);
        const targetCategory =
          categories.find((category) => category.slug === 'general-discussion') ?? categories[0];

        let threads: ForumThreadPreview[] = [];

        if (targetCategory) {
          const threadsResponse = await forumService.getThreadsByCategory(targetCategory.slug, 1, 4, 'latest');
          threads = extractCollection<ForumThreadPreview>(threadsResponse);
        }

        if (!threads.length && categories.length > 1) {
          for (const category of categories.slice(0, 3)) {
            const threadsResponse = await forumService.getThreadsByCategory(category.slug, 1, 2, 'latest');
            threads = threads.concat(extractCollection<ForumThreadPreview>(threadsResponse));
            if (threads.length >= 4) {
              break;
            }
          }
        }

        if (isMounted) {
          setForumThreads(threads.slice(0, 4));
          setForumError(null);
        }
      } catch (error) {
        if (isMounted) {
          setForumError('Unable to load discussions right now.');
          setForumThreads([]);
        }
        console.error('Failed to fetch forum data:', error);
      }
    };

    const fetchNewsPreview = async () => {
      try {
        let articles: NewsArticlePreview[] = [];

        try {
          const featuredResponse = await newsService.getFeaturedArticles();
          articles = extractCollection<NewsArticlePreview>(featuredResponse);
        } catch (featuredError) {
          console.warn('No featured news articles available yet.', featuredError);
        }

        if (!articles.length) {
          const articlesResponse = await newsService.getArticles({ page: 1, limit: 3 });
          articles = extractCollection<NewsArticlePreview>(articlesResponse);
        }

        if (isMounted) {
          setNewsArticles(articles.slice(0, 3));
          setNewsError(null);
        }
      } catch (error) {
        if (isMounted) {
          setNewsError('Unable to load news at the moment.');
          setNewsArticles([]);
        }
        console.error('Failed to fetch news data:', error);
      }
    };

    setForumLoading(true);
    setNewsLoading(true);

    const tasks = [
      fetchForumPreview(),
      fetchNewsPreview(),
    ];

    Promise.allSettled(tasks).finally(() => {
      if (isMounted) {
        setForumLoading(false);
        setNewsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const formatRelativeTime = (isoDate?: string) => {
    if (!isoDate) {
      return 'moments ago';
    }

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return 'moments ago';
    }

    const now = Date.now();
    const diff = now - date.getTime();
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;

    if (diff >= day) {
      const days = Math.round(diff / day);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    if (diff >= hour) {
      const hours = Math.round(diff / hour);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    if (diff >= minute) {
      const minutes = Math.round(diff / minute);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }

    return 'moments ago';
  };

  const formatDate = (isoDate?: string) => {
    if (!isoDate) {
      return '';
    }

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getInitials = (name?: string) => {
    if (!name) {
      return 'AI';
    }

    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  // Simple client-side A/B test for hero variant
  const abKey = 'ab_hero_v1';
  const [variant] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(abKey);
      if (saved === 'A' || saved === 'B') return saved;
      const assigned = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem(abKey, assigned);
      return assigned;
    } catch {
      return 'A';
    }
  });

  return (
    <div className="space-y-24 md:space-y-32 animate-fade-in-up">
      <Seo
        title="Mike’s AI Forge — AI tools, workflows, forum, and news"
        description="Battle‑tested AI tools, one‑click automations, a vibrant community forum, and curated AI news — ship faster with Mike’s AI Forge."
        canonicalPath="/"
      />
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24 relative">
        <div className="absolute inset-0 -top-32 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[400px] bg-brand-primary/20 rounded-full blur-3xl" />
        </div>
        <div className="relative">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
            {variant === 'A' ? (
              <>
                <span className="block">I test it on YouTube.</span>
                <span className="block">You deploy it in one click.</span>
              </>
            ) : (
              <>
                <span className="block">Ship AI workflows faster.</span>
                <span className="block">Pick the best tools with confidence.</span>
              </>
            )}
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-light-secondary">
            Welcome to Mike&apos;s AI Forge — your hub for battle-tested AI tools, one-click automations, a vibrant community forum, and the latest AI news curated for creators.
          </p>
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <Link
              to="/utilities"
              className="inline-block bg-brand-primary text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
              data-analytics-event="cta_click"
              data-analytics-props={`{"cta":"hero_try_utilities","variant":"${variant}"}`}
            >
              Try Free Utilities
            </Link>
            <Link
              to="/tools"
              className="inline-block bg-transparent text-light-primary font-semibold px-8 py-3 rounded-lg border border-border-dark shadow-sm hover:bg-dark-secondary transition-colors"
              data-analytics-event="cta_click"
              data-analytics-props={`{"cta":"hero_browse_tools","variant":"${variant}"}`}
            >
              Browse AI Tools
            </Link>
            <Link
              to="/forum"
              className="inline-block bg-dark-secondary text-light-primary font-semibold px-8 py-3 rounded-lg border border-border-dark shadow-sm hover:border-brand-primary hover:text-white transition-colors"
              data-analytics-event="cta_click"
              data-analytics-props={`{"cta":"hero_join_community","variant":"${variant}"}`}
            >
              Join the Community
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-light-primary sm:text-4xl">Featured AI Tools</h2>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-light-secondary sm:mt-4">
            Curated and tested tools to level up your workflow.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => <ToolCardSkeleton key={index} />)
          ) : (
            tools.slice(0, 3).map((tool, index) => (
              <div key={tool.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                <ToolCard tool={tool} />
              </div>
            ))
          )}
        </div>
        <div className="text-center mt-10">
          <Link to="/tools" className="text-brand-primary font-semibold hover:underline">
            View All Tools &rarr;
          </Link>
        </div>
      </section>

      {/* Forum Preview Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-light-primary sm:text-4xl">Join the Community</h2>
            <p className="mt-3 max-w-2xl text-lg text-light-secondary">
              Explore active discussions, share your workflows, and connect with makers who are building the future with AI.
            </p>
          </div>
          <Link
            to="/forum"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-brand-primary/10 text-brand-primary font-semibold border border-brand-primary/20 hover:bg-brand-primary/20 transition-colors"
          >
            View Forum
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forumLoading ? (
            Array.from({ length: 4 }).map((_, index) => <ForumThreadSkeleton key={index} />)
          ) : forumThreads.length > 0 ? (
            forumThreads.map((thread) => {
              const threadLink = thread.slug ? `/forum/thread/${thread.slug}` : '/forum';
              const lastActivityLabel = formatRelativeTime(thread.lastActivityAt ?? thread.createdAt);
              return (
                <Link
                  key={thread.id}
                  to={threadLink}
                  className="group bg-dark-secondary border border-border-dark rounded-xl p-6 hover:border-brand-primary/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-light-secondary/70">
                        {thread.category?.name ?? 'Community Thread'}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-light-primary group-hover:text-brand-primary transition-colors">
                        {thread.title}
                      </h3>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 text-brand-primary px-3 py-1 text-sm font-semibold">
                        {thread.replyCount ?? 0} replies
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    {thread.author?.avatarUrl ? (
                      <img
                        src={thread.author.avatarUrl}
                        alt={thread.author.name ?? 'Community member avatar'}
                        className="w-10 h-10 rounded-full object-cover border border-border-dark/60"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-sm font-semibold text-brand-primary">
                        {getInitials(thread.author?.name)}
                      </div>
                    )}
                    <div>
                      <p className="text-light-primary font-medium">{thread.author?.name ?? 'Community Member'}</p>
                      <p className="text-sm text-light-secondary">
                        Last activity {lastActivityLabel}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full bg-dark-secondary border border-border-dark rounded-xl p-10 text-center">
              <h3 className="text-2xl font-semibold text-light-primary">Be the first to start a discussion</h3>
              <p className="mt-3 text-light-secondary max-w-2xl mx-auto">
                No threads yet. Share your ideas, ask a question, or highlight your latest automation in the community forum.
              </p>
              <Link
                to="/forum"
                className="inline-flex items-center justify-center px-5 py-3 mt-6 rounded-lg bg-brand-primary text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Start a Conversation
              </Link>
            </div>
          )}
        </div>
        {forumError && (
          <p className="mt-6 text-center text-sm text-red-400">
            {forumError}
          </p>
        )}
        <div className="text-center mt-10">
          <Link to="/forum" className="text-brand-primary font-semibold hover:underline">
            View All Discussions &rarr;
          </Link>
        </div>
      </section>

      {/* News Preview Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-light-primary sm:text-4xl">Latest AI News</h2>
            <p className="mt-3 max-w-2xl text-lg text-light-secondary">
              Stay updated with curated AI breakthroughs, product launches, and expert insights delivered directly from the field.
            </p>
          </div>
          <Link
            to="/news"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-brand-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Read AI News
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsLoading ? (
            Array.from({ length: 3 }).map((_, index) => <NewsCardSkeleton key={index} />)
          ) : newsArticles.length > 0 ? (
            newsArticles.map((article) => {
              const articleLink = article.slug ? `/news/${article.slug}` : '/news';
              return (
                <Link
                  key={article.id}
                  to={articleLink}
                  className="group bg-dark-secondary border border-border-dark rounded-xl overflow-hidden hover:border-brand-primary/60 transition-colors flex flex-col"
                >
                  {article.imageUrl ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-brand-primary/20 via-brand-primary/10 to-transparent flex items-center justify-center text-brand-primary text-4xl">
                      📰
                    </div>
                  )}
                  <div className="p-6 flex flex-col gap-4 flex-1">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-light-secondary/70">
                      <span>{article.category ?? 'AI Insights'}</span>
                      <span>{formatDate(article.publishedAt) || 'Recently'}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-light-primary group-hover:text-brand-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-light-secondary text-sm leading-relaxed flex-1">
                      {article.summary ?? 'Tap in to discover the latest developments shaping the AI landscape.'}
                    </p>
                    {article.source && (
                      <p className="text-xs text-light-secondary/80">
                        Source: {article.source}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full bg-dark-secondary border border-border-dark rounded-xl p-10 text-center">
              <h3 className="text-2xl font-semibold text-light-primary">No news articles yet</h3>
              <p className="mt-3 text-light-secondary max-w-2xl mx-auto">
                We&apos;re curating the most relevant AI updates for you. Check back soon or explore the archive.
              </p>
              <Link
                to="/news"
                className="inline-flex items-center justify-center px-5 py-3 mt-6 rounded-lg bg-brand-primary text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Visit News Hub
              </Link>
            </div>
          )}
        </div>
        {newsError && (
          <p className="mt-6 text-center text-sm text-red-400">
            {newsError}
          </p>
        )}
        <div className="text-center mt-10">
          <Link to="/news" className="text-brand-primary font-semibold hover:underline">
            Read More News &rarr;
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <Testimonials />
      </section>

      {/* Pillars Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <div className="bg-dark-secondary p-8 rounded-xl border border-border-dark">
          <h3 className="text-2xl font-bold text-light-primary">Workflow Vault</h3>
          <p className="mt-2 text-light-secondary">
            One-click deploy workflows from my videos via Make, Zapier, and more.
          </p>
        </div>
        <div className="bg-dark-secondary p-8 rounded-xl border border-border-dark">
          <h3 className="text-2xl font-bold text-light-primary">Content Automation Studio</h3>
          <p className="mt-2 text-light-secondary">
            Turn long-form content into shorts, captions, and titles automatically.
          </p>
        </div>
        <div className="bg-dark-secondary p-8 rounded-xl border border-border-dark">
          <h3 className="text-2xl font-bold text-light-primary">Community Forum</h3>
          <p className="mt-2 text-light-secondary">
            Connect with creators, swap playbooks, and get feedback from peers building with AI.
          </p>
        </div>
        <div className="bg-dark-secondary p-8 rounded-xl border border-border-dark">
          <h3 className="text-2xl font-bold text-light-primary">AI News Hub</h3>
          <p className="mt-2 text-light-secondary">
            Stay ahead with curated news, tool launches, and research insights delivered daily.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
