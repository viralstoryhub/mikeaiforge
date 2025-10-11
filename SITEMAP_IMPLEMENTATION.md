# Dynamic Sitemap Implementation Guide

## Overview

A dynamic sitemap generator script has been created at `scripts/generate-sitemap.ts`. This script generates a complete sitemap including all static and dynamic pages (tools, news articles, forum threads).

## Current Status

✅ **Created**: Sitemap generator script with smart URL generation  
⚠️ **Pending**: Integration with actual data sources  
⚠️ **Pending**: Adding npm script and automation

---

## Implementation Steps

### 1. Install Required Dependencies

The script uses TypeScript and needs `tsx` to run:

```bash
npm install --save-dev tsx
```

### 2. Add NPM Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "generate-sitemap": "tsx scripts/generate-sitemap.ts",
    "prebuild": "npm run generate-sitemap",
    "build": "tsc && vite build"
  }
}
```

This will automatically generate the sitemap before every build.

### 3. Integrate with Your Data Sources

Edit `scripts/generate-sitemap.ts` and replace the `loadDynamicData()` function with actual data fetching:

#### Option A: Fetch from API

```typescript
async function loadDynamicData() {
  const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';
  
  try {
    const [toolsRes, newsRes, threadsRes] = await Promise.all([
      fetch(`${API_URL}/api/tools`),
      fetch(`${API_URL}/api/news`),
      fetch(`${API_URL}/api/forum/threads`),
    ]);
    
    const tools = await toolsRes.json();
    const news = await newsRes.json();
    const threads = await threadsRes.json();
    
    return { 
      tools: tools.items || tools || [], 
      news: news.items || news || [], 
      threads: threads.items || threads || [] 
    };
  } catch (error) {
    console.warn('⚠️  Could not fetch dynamic data, using empty arrays');
    return { tools: [], news: [], threads: [] };
  }
}
```

#### Option B: Import from Static Data Files

```typescript
import toolsData from '../src/data/tools.json';
import newsData from '../src/data/news.json';
import forumsData from '../src/data/forums.json';

async function loadDynamicData() {
  return { 
    tools: toolsData, 
    news: newsData, 
    threads: forumsData 
  };
}
```

#### Option C: Fetch from Database

```typescript
import { db } from '../backend/database';

async function loadDynamicData() {
  const tools = await db.tools.findMany({ 
    select: { id: true, slug: true, updatedAt: true } 
  });
  
  const news = await db.newsArticles.findMany({ 
    select: { id: true, slug: true, publishedAt: true } 
  });
  
  const threads = await db.forumThreads.findMany({ 
    select: { id: true, slug: true, category: true, updatedAt: true } 
  });
  
  return { tools, news, threads };
}
```

### 4. Run the Generator

Manually run the generator:

```bash
npm run generate-sitemap
```

The sitemap will be generated at `public/sitemap.xml`.

### 5. Verify Output

Check that your sitemap includes all pages:

```bash
# View the generated sitemap
cat public/sitemap.xml

# Or open in browser during development
# http://localhost:5173/sitemap.xml
```

### 6. Submit to Search Engines

Once generated and deployed:

1. **Google Search Console**: 
   - Go to https://search.google.com/search-console
   - Add property: `https://mikesaiforge.netlify.app`
   - Submit sitemap: `https://mikesaiforge.netlify.app/sitemap.xml`

2. **Bing Webmaster Tools**:
   - Go to https://www.bing.com/webmasters
   - Add site and submit sitemap

3. **Add to robots.txt**:
   Edit `public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://mikesaiforge.netlify.app/sitemap.xml
   ```

---

## Features

### ✅ Smart URL Generation
- Automatically formats dates to ISO 8601
- Calculates priority based on page type
- Sets appropriate change frequency

### ✅ Comprehensive Coverage
- **Static pages**: Home, Tools, News, Forum, etc.
- **Dynamic pages**: Individual tools, articles, threads
- **Metadata**: Priority, change frequency, last modified dates

### ✅ SEO Best Practices
- Proper XML structure
- Valid sitemap schema
- Optimized priorities
- Fresh lastmod dates

### ✅ Error Handling
- Graceful fallbacks if data unavailable
- Helpful console logs for debugging
- Non-blocking errors

---

## Sitemap Priorities Explained

| Page Type | Priority | Change Frequency | Reasoning |
|-----------|----------|------------------|-----------|
| Homepage | 1.0 | weekly | Most important page |
| Tools Directory | 0.9 | weekly | Primary feature page |
| News Hub | 0.9 | daily | Fresh content updates |
| Individual Tools | 0.8 | weekly | High-value pages |
| News Articles | 0.7 | monthly | SEO-valuable content |
| Forum Threads | 0.6 | daily | User-generated content |
| Utilities | 0.7 | monthly | Feature pages |
| Auth Pages | 0.3 | yearly | Low SEO value |

---

## Troubleshooting

### Issue: "Cannot find module 'tsx'"
**Solution**: Install tsx: `npm install --save-dev tsx`

### Issue: "No tools/news/threads found"
**Solution**: Implement data fetching in `loadDynamicData()` function

### Issue: Sitemap not updating
**Solution**: Ensure `prebuild` script runs before build

### Issue: URLs returning 404
**Solution**: Verify routing matches sitemap URL structure

---

## Advanced: Automated Daily Updates

For sites with frequently changing content, set up a cron job or GitHub Action:

### GitHub Actions Example

Create `.github/workflows/update-sitemap.yml`:

```yaml
name: Update Sitemap

on:
  schedule:
    - cron: '0 0 * * *'  # Run daily at midnight
  workflow_dispatch:  # Allow manual trigger

jobs:
  update-sitemap:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run generate-sitemap
      - name: Commit sitemap
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add public/sitemap.xml
          git commit -m "chore: update sitemap [skip ci]" || exit 0
          git push
```

This will regenerate the sitemap daily with fresh content.

---

## Performance Considerations

- **Large sites (>10k URLs)**: Consider sitemap index files
- **Build time**: Generation adds ~2-5 seconds to build
- **Caching**: Sitemaps are cached by search engines for 24-48 hours

---

## Next Steps

1. ✅ Install `tsx` dependency
2. ✅ Add npm scripts to `package.json`
3. ⚠️ Implement data fetching in `loadDynamicData()`
4. ⚠️ Run generator and verify output
5. ⚠️ Submit to Google Search Console
6. ⚠️ Monitor indexing in Search Console

---

## Resources

- [Google Sitemap Protocol](https://www.sitemaps.org/protocol.html)
- [Google Search Console Help](https://support.google.com/webmasters/answer/183668)
- [Bing Sitemap Guidelines](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed)

---

**Status**: Ready to implement  
**Effort**: ~30 minutes  
**SEO Impact**: High (improved crawlability and indexing)