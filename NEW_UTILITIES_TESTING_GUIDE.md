# 🧪 New Utilities Testing Guide

## Quick Start

### 1. Set Up Environment
```bash
# Make sure you have a Gemini API key in your .env file
echo "VITE_GEMINI_API_KEY=your-api-key-here" >> .env
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Navigate to Utilities
Open browser to: `http://localhost:5173/#/utilities`

You should now see **16 utilities** (previously 11).

---

## 🧪 Testing Checklist

### ✅ AI Resume Builder (`/utilities/ai-resume-builder`)

**Test Case 1: Basic Functionality**
1. Navigate to the utility
2. Paste this job description:
```
Senior Frontend Developer

We're looking for an experienced React developer with:
- 5+ years of React experience
- TypeScript proficiency
- State management (Redux/Zustand)
- RESTful API integration
- Git & CI/CD experience

Responsibilities:
- Build scalable web applications
- Mentor junior developers
- Code reviews and best practices
- Collaborate with design team
```

3. Click "Optimize My Resume"
4. ✅ **Expected**: Should get optimized summary, skills badges, experience bullets, recommendations

**Test Case 2: With Current Resume**
1. In "Current Resume" field, paste:
```
Software Engineer with 6 years experience in JavaScript.
Built e-commerce sites and worked with APIs.
Used GitHub for version control.
```

2. Use the same job description
3. Click "Optimize My Resume"
4. ✅ **Expected**: More personalized results based on your current experience

**Test Case 3: Free Tier Limit**
1. Use the utility 3 times
2. On 4th attempt, should see "You've reached your free limit" message
3. ✅ **Expected**: Button disabled, upgrade prompt shown

---

### ✅ Voice-to-Blog Generator (`/utilities/voice-to-blog`)

**Test Case 1: Text Input**
1. Navigate to the utility
2. Paste this transcript:
```
Hey everyone, today I want to talk about the future of AI in web development. 
AI tools like GitHub Copilot and ChatGPT are revolutionizing how we code. 
They help us write faster, catch bugs earlier, and learn new technologies quickly.

The key is to use AI as a copilot, not a replacement. You still need to understand 
what the code does. Think of AI as a really smart junior developer who can generate 
boilerplate code while you focus on architecture and business logic.

My advice? Start using AI tools today. They're only going to get better, and the 
developers who learn to work alongside AI will have a huge advantage.
```

3. Click "Generate Blog Post"
4. ✅ **Expected**: Full blog post with title, intro, body, conclusion, and tags

**Test Case 2: Voice Recording** (requires microphone)
1. Click "Start Recording"
2. Speak for 30 seconds about any topic
3. Click "Stop Recording"
4. Wait for transcription
5. Click "Generate Blog Post"
6. ✅ **Expected**: Transcript appears, then blog post generated

**Test Case 3: Copy Functionality**
1. After generating a blog post
2. Click "Copy Full Blog Post"
3. ✅ **Expected**: Toast notification "Copied to clipboard!"

---

### ✅ CSV Data Visualizer (`/utilities/csv-data-visualizer`)

**Test Case 1: Manual CSV Input**
1. Navigate to the utility
2. Paste this CSV data:
```
Month,Sales,Expenses,Profit
January,45000,32000,13000
February,52000,35000,17000
March,48000,33000,15000
April,61000,38000,23000
May,58000,36000,22000
June,67000,40000,27000
```

3. In "Specific Question" field, type: "What trends do you see?"
4. Click "Analyze Data"
5. ✅ **Expected**: Summary, insights, trends, chart suggestions, recommendations

**Test Case 2: File Upload**
1. Create a CSV file on your computer with the above data
2. Click "Upload CSV File"
3. Select your file
4. ✅ **Expected**: Data appears in textarea, toast shows "CSV file loaded successfully!"
5. Click "Analyze Data"
6. ✅ **Expected**: Analysis results appear

**Test Case 3: Chart Suggestions**
1. After analyzing data
2. Look at "Visualization Recommendations" section
3. ✅ **Expected**: Should see 3-5 chart suggestions with:
   - Chart type (Bar Chart, Line Graph, etc.)
   - Title for the chart
   - Description of what it should show

---

### ✅ LinkedIn Post Optimizer (`/utilities/linkedin-post-optimizer`)

**Test Case 1: Basic Post Optimization**
1. Navigate to the utility
2. Paste this LinkedIn post:
```
Just launched my new website! Check it out.

Let me know what you think in the comments.
```

3. Select Goal: "Maximize Engagement"
4. Click "Optimize Post"
5. ✅ **Expected**: 
   - Original score (should be low, around 30-50)
   - Optimized post (much better)
   - Optimized score (should be 70-90)
   - Improvements list
   - Hashtags
   - Engagement tips

**Test Case 2: Different Goals**
1. Use the same post
2. Try each goal option:
   - Maximize Engagement
   - Maximize Reach
   - Generate Leads
   - Establish Thought Leadership
3. ✅ **Expected**: Different optimizations based on the goal

**Test Case 3: Copy Optimized Post**
1. After optimization
2. Click "Copy Post" button
3. ✅ **Expected**: Optimized post + hashtags copied to clipboard

---

### ✅ Code Debugger (`/utilities/code-debugger`)

**Test Case 1: JavaScript Bug**
1. Navigate to the utility
2. Select Language: "JavaScript"
3. Paste this buggy code:
```javascript
const users = [
  { name: 'John', age: 25 },
  { name: 'Jane', age: 30 }
];

// Bug: Accessing index that doesn't exist
const user = users[5];
console.log(user.name);
```

4. In "Error Message" field, paste:
```
TypeError: Cannot read properties of undefined (reading 'name')
```

5. Click "Debug My Code"
6. ✅ **Expected**:
   - Error explanation
   - Root cause
   - Fixed code
   - Prevention tips
   - Related issues

**Test Case 2: Python Bug**
1. Select Language: "Python"
2. Paste this code:
```python
def divide_numbers(a, b):
    return a / b

result = divide_numbers(10, 0)
print(result)
```

3. Error Message: `ZeroDivisionError: division by zero`
4. Click "Debug My Code"
5. ✅ **Expected**: Fix with try-except handling

**Test Case 3: TypeScript Bug**
1. Select Language: "TypeScript"
2. Paste this code:
```typescript
interface User {
  name: string;
  age: number;
}

const user: User = {
  name: 'John',
  email: 'john@example.com'
};
```

3. Error: `Property 'email' does not exist on type 'User'`
4. Click "Debug My Code"
5. ✅ **Expected**: Explanation + fixed interface

---

## 🔍 Common Issues & Solutions

### Issue: "AI service is not configured"
**Solution**: Add Gemini API key to `.env`:
```bash
VITE_GEMINI_API_KEY=your-actual-api-key
```
Then restart the dev server.

### Issue: Voice recording not working
**Solution**: 
- Make sure you're using HTTPS (or localhost)
- Grant microphone permissions when prompted
- Check browser console for errors

### Issue: "You've reached your free limit"
**Solution**: 
- This is expected behavior
- In production, users would upgrade to Pro
- For testing, you can reset by clearing the user's `utilityUsage` in backend database
- Or create a new test account

### Issue: CSV upload not working
**Solution**:
- Make sure the file is `.csv` format
- Check that the CSV has headers in the first row
- Try pasting the data manually instead

---

## 📊 Success Metrics

After testing all 5 utilities, you should have:

✅ **AI Resume Builder**
- [ ] Generated optimized resume content
- [ ] Skills displayed as badges
- [ ] Experience bullets formatted nicely
- [ ] Copy buttons work
- [ ] Free tier limit enforced

✅ **Voice-to-Blog Generator**
- [ ] Voice recording works (or text input works)
- [ ] Blog post has title, intro, body, conclusion
- [ ] Tags are relevant
- [ ] Markdown formatting in body
- [ ] Copy functionality works

✅ **CSV Data Visualizer**
- [ ] CSV file upload works
- [ ] Manual paste works
- [ ] Analysis provides meaningful insights
- [ ] Chart suggestions are relevant
- [ ] Trends identified correctly

✅ **LinkedIn Post Optimizer**
- [ ] Original score calculated
- [ ] Optimized post is better than original
- [ ] Improved score is higher
- [ ] Hashtags are relevant
- [ ] Different goals produce different results

✅ **Code Debugger**
- [ ] Detects error correctly
- [ ] Provides clear explanation
- [ ] Fixed code compiles/runs
- [ ] Prevention tips are actionable
- [ ] Supports multiple languages

---

## 🚀 Performance Testing

### Speed Test
Each utility should respond within:
- ⚡ **Fast**: 3-5 seconds (Resume Builder, LinkedIn Optimizer)
- ⚡ **Medium**: 5-10 seconds (Voice-to-Blog, CSV Visualizer)
- ⚡ **Slower**: 10-15 seconds (Code Debugger with large code)

If slower, check:
- Gemini API key is valid
- Internet connection is stable
- Not hitting rate limits

---

## 📱 Mobile Testing

Test on mobile devices:
1. Open on phone: `http://your-ip:5173/#/utilities`
2. Check each utility:
   - [ ] Responsive layout
   - [ ] Forms are usable
   - [ ] Buttons are tap-friendly
   - [ ] Results are readable
   - [ ] Copy buttons work

---

## 🎯 Ready for Production?

Before deploying, ensure:
- [ ] All 5 utilities tested and working
- [ ] Error handling works (try invalid inputs)
- [ ] Loading states show properly
- [ ] Copy buttons work on all results
- [ ] Free tier limits enforced
- [ ] Mobile responsive
- [ ] Gemini API key is in production `.env`
- [ ] All TypeScript errors resolved (run `npm run type-check`)
- [ ] Build succeeds (`npm run build`)

---

## 🆘 Need Help?

### Getting Gemini API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Add to `.env` as `VITE_GEMINI_API_KEY=your-key`
5. Restart dev server

### Debugging Tips
- Open browser console (F12) for errors
- Check Network tab to see API calls
- Look for toast notifications (bottom-right corner)
- Check localStorage for saved form state

---

**Happy Testing! 🎉**

If all tests pass, you're ready to show off your 16 AI utilities! 🚀