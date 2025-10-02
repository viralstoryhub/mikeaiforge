
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UTILITIES_DATA, UTILITY_CATEGORIES } from '../constants';
import { TitleIcon, ListIcon, ClosedCaptionIcon, ImageIcon } from '../components/icons/UtilityIcons';
import { FilmIcon, CameraIcon, MicrophoneIcon, SparklesIcon, WandIcon } from '../components/icons/ExtraIcons';
import { useTiltEffect } from '../hooks/useTiltEffect';
import type { Utility } from '../types';

type CategoryTab = {
  slug: string;
  name: string;
  description: string;
};

const ALL_UTILITIES_TAB: CategoryTab = {
  slug: 'all',
  name: 'All Utilities',
  description: 'Browse the full catalog of utility tools organized by category.',
};

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    TitleIcon,
    ListIcon,
    ClosedCaptionIcon,
    ImageIcon,
    CameraIcon,
    FilmIcon,
    MicrophoneIcon,
    SparklesIcon,
    WandIcon,
};

const UtilityCard: React.FC<{ utility: Utility }> = ({ utility }) => {
  const tiltRef = useTiltEffect<HTMLDivElement>();
  const IconComponent = iconMap[utility.icon];

  return (
    <div ref={tiltRef} className="tilt-card h-full group">
      <Link
        to={utility.path}
        className="block p-6 bg-dark-secondary rounded-lg border border-border-dark group-hover:border-brand-primary/50 transition-colors duration-300 h-full relative overflow-hidden glare-effect"
      >
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 bg-dark-primary p-3 rounded-lg border border-border-dark">
            {IconComponent && <IconComponent className="w-6 h-6 text-brand-primary" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-light-primary group-hover:text-brand-primary">{utility.name}</h3>
            <p className="mt-1 text-sm text-light-secondary">{utility.description}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};


const UtilitiesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_UTILITIES_TAB.slug);
  const [searchTerm, setSearchTerm] = useState('');

  const categoryTabs: CategoryTab[] = [
    ALL_UTILITIES_TAB,
    ...UTILITY_CATEGORIES.map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.description,
    })),
  ];

  const filteredUtilities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return UTILITIES_DATA.filter((utility) => {
      if (activeCategory !== ALL_UTILITIES_TAB.slug && utility.category !== activeCategory) {
        return false;
      }
      if (!term) {
        return true;
      }
      const haystack = `${utility.name} ${utility.description ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [activeCategory, searchTerm]);

  const categorySections = useMemo(() => {
    const relevantCategories =
      activeCategory === ALL_UTILITIES_TAB.slug
        ? UTILITY_CATEGORIES
        : UTILITY_CATEGORIES.filter((category) => category.slug === activeCategory);

    return relevantCategories.map((category) => {
      const subSections = category.subcategories.map((subcategory) => {
        const utilities = filteredUtilities.filter(
          (utility) =>
            utility.category === category.slug && utility.subcategory === subcategory.slug
        );
        return { subcategory, utilities };
      });

      return {
        category,
        subSections,
      };
    });
  }, [activeCategory, filteredUtilities]);

  const renderableSections =
    activeCategory === ALL_UTILITIES_TAB.slug
      ? categorySections
          .map((section) => ({
            category: section.category,
            subSections: section.subSections.filter(
              (subSection) => subSection.utilities.length > 0
            ),
          }))
          .filter((section) => section.subSections.length > 0)
      : categorySections.map((section) => ({
          category: section.category,
          subSections: section.subSections.filter(
            (subSection) => subSection.utilities.length > 0
          ),
        }));

  const activeTabMeta =
    categoryTabs.find((tab) => tab.slug === activeCategory) ?? ALL_UTILITIES_TAB;

  const hasResults = renderableSections.some((section) => section.subSections.length > 0);

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-light-primary sm:text-5xl">Utility Tools</h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-light-secondary sm:mt-4">
          Get instant value with free, powerful tools for creators and marketers. No login required for your first few runs.
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="overflow-x-auto">
            <div className="inline-flex min-w-full gap-2">
              {categoryTabs.map((tab) => {
                const isActive = tab.slug === activeCategory;
                return (
                  <button
                    key={tab.slug}
                    type="button"
                    onClick={() => setActiveCategory(tab.slug)}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                      isActive
                        ? 'bg-brand-primary text-dark-primary border-brand-primary shadow-lg shadow-brand-primary/20'
                        : 'bg-dark-secondary text-light-secondary border-border-dark hover:text-light-primary hover:border-brand-primary/40'
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full lg:w-72">
            <label className="relative block">
              <span className="sr-only">Search utilities</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search utilities..."
                className="w-full rounded-full border border-border-dark bg-dark-secondary py-2 pl-4 pr-16 text-sm text-light-primary placeholder:text-light-secondary/60 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-2 my-auto inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
                >
                  Clear
                </button>
              )}
            </label>
          </div>
        </div>

        <div className="text-center sm:text-left">
          <p className="mx-auto max-w-3xl text-light-secondary transition-colors duration-300 sm:mx-0">
            {activeTabMeta.description}
          </p>
        </div>

        <div className="space-y-10">
          {renderableSections.map((section) =>
            section.subSections.length > 0 ? (
              <section key={section.category.slug} className="space-y-4 animate-fade-in-up">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-light-primary">{section.category.name}</h2>
                  <p className="text-sm text-light-secondary">{section.category.description}</p>
                </div>

                <div className="space-y-4">
                  {section.subSections.map((subSection) => (
                    <details
                      key={`${section.category.slug}-${subSection.subcategory.slug}`}
                      className="group rounded-xl border border-border-dark bg-dark-secondary/60 shadow-lg shadow-black/10 backdrop-blur-sm"
                      open
                    >
                      <summary className="flex cursor-pointer items-center justify-between px-5 py-3 text-light-primary transition-colors duration-300 hover:text-brand-primary list-none marker:content-none">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{subSection.subcategory.name}</span>
                          <span className="text-xs uppercase tracking-widest text-light-secondary/70">
                            {subSection.utilities.length} {subSection.utilities.length === 1 ? 'tool' : 'tools'}
                          </span>
                        </div>
                        <span className="text-light-secondary transition-transform duration-300 group-open:-rotate-180">⌄</span>
                      </summary>

                      <div className="px-5 pb-5">
                        <p className="mb-4 text-xs text-light-secondary">{subSection.subcategory.description}</p>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {subSection.utilities.map((utility, index) => (
                            <div
                              key={utility.id}
                              className="animate-fade-in-up h-full"
                              style={{ animationDelay: `${index * 80}ms` }}
                            >
                              <UtilityCard utility={utility} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ) : null
          )}

          {!hasResults && (
            <div className="rounded-2xl border border-border-dark bg-dark-secondary/60 py-16 text-center shadow-inner shadow-black/40">
              <p className="text-light-secondary">
                No utilities match your current filters.
                {searchTerm ? ' Try a different search term or clear your search.' : ' Please check back soon for new additions.'}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mt-6 inline-flex items-center rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-dark-primary transition-colors duration-300 hover:bg-brand-primary/90"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UtilitiesPage;
