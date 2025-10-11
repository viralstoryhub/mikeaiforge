# 📝 How to Add a New Utility - Quick Reference

## 🎯 Template

Copy this template to `src/constants.ts` in the `UTILITIES_DATA` array:

```typescript
{
  id: '17', // Next available ID
  slug: 'my-new-utility', // URL-friendly name
  name: 'My New Utility', // Display name
  description: 'Clear, concise description of what this utility does (1-2 sentences max).', // Shows on card
  path: '/utilities/my-new-utility', // Must match slug
  icon: 'SparklesIcon', // Choose from iconMap
  category: 'content-management', // or 'seo' or 'saas'
  subcategory: 'repurposing', // Match existing subcategory
  badge: 'NEW', // Optional: 'NEW' | 'POPULAR' | 'PRO' | 'BETA'
  estimatedTime: '2-3 min', // How long to use (be realistic)
  difficulty: 'Easy', // 'Easy' | 'Medium' | 'Hard'
  steps: [
    'First clear action step',
    'Second clear action step',
    'Third step - get results'
  ],
  useCases: [
    'Primary use case',
    'Secondary use case',
    'Third use case'
  ],
}
```

---

## 📋 Field Guide

### **Required Fields:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Unique identifier | `'17'` |
| `slug` | string | URL-friendly name | `'ai-translator'` |
| `name` | string | Display name | `'AI Translator'` |
| `description` | string | What it does (1-2 sentences) | `'Translate text into 50+ languages...'` |
| `path` | string | URL path (match slug!) | `'/utilities/ai-translator'` |
| `icon` | string | Icon component name | `'SparklesIcon'` |
| `category` | string | Main category | `'content-management'` |
| `subcategory` | string | Sub-category | `'creation'` |

### **Optional Fields (Recommended!):**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `badge` | string | Visual indicator | `'NEW'` |
| `estimatedTime` | string | How long to use | `'1-2 min'` |
| `difficulty` | string | Skill level | `'Easy'` |
| `steps` | array | How-to guide (3 steps) | `['Paste text', 'Choose language', 'Get translation']` |
| `useCases` | array | What it's good for (3 tags) | `['Documents', 'Emails', 'Websites']` |

---

## 🎨 Badge Options

Choose ONE badge per utility:

- **`'NEW'`** 🟢 - Just launched (use for first 2-4 weeks)
- **`'POPULAR'`** 🟣 - Most used (based on analytics)
- **`'PRO'`** 🟠 - Premium feature (requires subscription)
- **`'BETA'`** 🔵 - Testing phase (experimental)

**Don't use a badge?** Just omit the field or set to `undefined`.

---

## 📦 Category Guide

### **Available Categories:**

#### **1. SEO** (`'seo'`)
For discoverability, optimization, and reach tools.

**Subcategories:**
- `'video-seo'` - YouTube chapters, summaries
- `'thumbnails'` - Thumbnail generation & testing
- `'titles-hooks'` - Title & hook generation

#### **2. Content Management** (`'content-management'`)
For creation, editing, and repurposing tools.

**Subcategories:**
- `'creation'` - Original content creation
- `'repurposing'` - Transform existing content
- `'captions'` - Subtitle & caption tools
- `'transcription'` - Audio/video to text
- `'thumbnail-creation'` - Thumbnail generation
- `'image-editing'` - Image manipulation

#### **3. SaaS** (`'saas'`)
For productivity and business tools.

**Subcategories:**
- `'productivity'` - Workflow & efficiency tools
- `'video-tools'` - Video creation & editing

---

## 🎭 Icon Options

Choose from these available icons:

```typescript
const iconMap = {
  'TitleIcon',           // Titles, headers
  'ListIcon',            // Lists, summaries
  'ClosedCaptionIcon',   // Captions, subtitles
  'ImageIcon',           // Images, photos
  'CameraIcon',          // Thumbnails, photos
  'FilmIcon',            // Videos, clips
  'MicrophoneIcon',      // Audio, voice
  'SparklesIcon',        // AI, magic
  'WandIcon',            // Editing, transformation
  'DocumentIcon',        // Documents, text
  'ChartIcon',           // Data, analytics
  'CodeIcon',            // Programming, code
};
```

**Pick the icon that best represents your utility's function.**

---

## ⏱️ Time Estimate Guidelines

Be realistic! Users appreciate honesty.

- **`'1 min'`** - Super quick (paste & click)
- **`'1-2 min'`** - Quick (simple input)
- **`'2-3 min'`** - Standard (moderate input)
- **`'3-4 min'`** - Detailed (complex input)
- **`'3-5 min'`** - Comprehensive (multiple inputs)
- **`'5-10 min'`** - Extended (practice/recording)

**Include processing time**, not just input time!

---

## 🎯 Difficulty Guidelines

### **Easy** 🟢 (Most utilities should be Easy!)
- Simple copy/paste
- 1-2 inputs maximum
- No technical knowledge needed
- Clear, obvious results
- Beginner-friendly

**Examples:** Title generator, text formatter, simple translator

### **Medium** 🟡
- Multiple inputs or options
- Some understanding helpful
- Moderate customization
- May require file upload

**Examples:** CSV analyzer, voice recording, code debugger

### **Hard** 🔴 (Rare!)
- Complex configuration
- Technical knowledge required
- Multiple steps with decisions
- Advanced features

**Examples:** Full app builder, complex automation setup

---

## 📝 Writing Good Steps

### **✅ Good Steps (Clear & Actionable):**

```typescript
steps: [
  'Paste your LinkedIn post',           // Clear action
  'Choose your goal (Engagement)',      // Specific choice
  'Get optimized version & tips'        // Clear outcome
]
```

### **❌ Bad Steps (Vague):**

```typescript
steps: [
  'Enter text',              // Too vague
  'Click something',         // Not specific
  'See results'              // Not helpful
]
```

### **Step Writing Tips:**

1. **Start with action verbs**: Paste, Upload, Choose, Select, Enter
2. **Be specific**: What exactly to paste/upload/choose?
3. **Include context**: Add helpful hints in parentheses
4. **Show outcome**: Last step should mention results

---

## 🏷️ Writing Good Use Cases

### **✅ Good Use Cases (Specific):**

```typescript
useCases: [
  'Job applications',        // Specific scenario
  'Career coaching',         // Who uses it
  'Resume optimization'      // What for
]
```

### **❌ Bad Use Cases (Too Generic):**

```typescript
useCases: [
  'Business',               // Too broad
  'Work stuff',             // Not helpful
  'Anything'                // Meaningless
]
```

### **Use Case Writing Tips:**

1. **Be specific**: "YouTube thumbnails" not "Images"
2. **Think scenarios**: When would someone use this?
3. **Include roles**: "Marketing teams", "Content creators"
4. **Limit to 3**: Most important use cases only

---

## 🚀 Example: Adding an AI Translator

```typescript
{
  id: '17',
  slug: 'ai-translator',
  name: 'AI Translator',
  description: 'Translate text into 50+ languages with context-aware AI for natural results.',
  path: '/utilities/ai-translator',
  icon: 'SparklesIcon',
  category: 'content-management',
  subcategory: 'creation',
  badge: 'NEW',
  estimatedTime: '1-2 min',
  difficulty: 'Easy',
  steps: [
    'Paste text to translate',
    'Select target language',
    'Get natural translation'
  ],
  useCases: [
    'Documents',
    'Emails',
    'Website content'
  ],
}
```

**That's it!** The utility card will automatically display:
- 🟢 NEW badge
- ⏱️ 1-2 min estimate
- ⚡ Easy difficulty
- 📋 3-step instructions
- 🏷️ 3 use case tags

---

## ✅ Checklist Before Adding

- [ ] Chose unique ID (next number in sequence)
- [ ] Slug is URL-friendly (lowercase, hyphens)
- [ ] Name is clear and descriptive
- [ ] Description is 1-2 sentences max
- [ ] Path matches slug exactly
- [ ] Icon makes sense for function
- [ ] Category and subcategory match existing ones
- [ ] Badge is appropriate (or omitted)
- [ ] Time estimate is realistic
- [ ] Difficulty matches complexity
- [ ] Steps are clear and actionable (3 steps)
- [ ] Use cases are specific (3 tags)

---

## 🔄 After Adding the Utility

### **1. Create the Component:**

Create file: `src/pages/utility/MyNewUtility.tsx`

Follow this pattern:
```typescript
import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import PersonaSelector from '../../components/PersonaSelector';

const FREE_TIER_LIMIT = 3;
const UTILITY_SLUG = 'my-new-utility';
const STORAGE_KEY = `formState_${UTILITY_SLUG}`;

const MyNewUtility: React.FC = () => {
  // Your utility logic here
};

export default MyNewUtility;
```

### **2. Add Route to App.tsx:**

```typescript
const MyNewUtility = React.lazy(() => import('./pages/utility/MyNewUtility'));

// In routes section:
<Route path="/utilities/my-new-utility" element={<MyNewUtility />} />
```

### **3. Add Gemini Function (if needed):**

In `src/services/geminiService.ts`:
```typescript
export const myNewUtilityFunction = async (input: string) => {
  // AI logic here
};
```

### **4. Test It:**

1. Run `npm run dev`
2. Go to `/utilities`
3. Find your new utility
4. Click and test
5. Verify all metadata shows correctly

---

## 🎉 Done!

Your new utility will automatically:
- ✅ Appear in the utilities list
- ✅ Show in correct category
- ✅ Display all metadata
- ✅ Be searchable
- ✅ Count in stats

**No additional configuration needed!**

---

## 📞 Need Help?

If you're stuck:
1. Look at existing utilities in `constants.ts`
2. Copy a similar utility and modify
3. Check `types.ts` for field definitions
4. Review `UtilitiesPage.tsx` to see how data is used

**Most important:** Be consistent with existing utilities!

---

**Happy building! 🚀**