# 🔧 Critical Fixes Implementation

**Date:** 2025-10-24  
**Priority:** CRITICAL  
**Status:** Implementing

---

## 🎯 Issues to Fix

### Issue #1: Code Button - Raw HTML to Formatted Text Conversion
**Problem:** Admin pastes raw HTML like `<h1>hi bro</h1>`, selects it, clicks code button expecting it to convert to formatted heading.

**Current Behavior:** Code button just wraps text in `<code>` tags (inline code).

**Expected Behavior:** Should parse and render the HTML as actual formatted content.

### Issue #2: Content Rendering - H1 Shows as Normal Text
**Problem:** H1 headings display correctly in RichTextEditor but show as normal text in published articles.

**Root Cause:** Likely CSS specificity issue or missing heading styles in published view.

### Issue #3: Favicon Not Displaying
**Problem:** Favicon.png exists but doesn't show in browser.

**Root Cause:** Need to convert PNG to ICO format and use proper Next.js favicon convention.

---

## ✅ Solutions

### Solution #1: HTML Parser Button

Add a new "Parse HTML" button that converts raw HTML to formatted content:

```typescript
// New button in toolbar
<ToolbarButton
  onClick={handleParseHTML}
  title="Parse HTML"
>
  <Code className="h-4 w-4" /> HTML
</ToolbarButton>

// Handler function
const handleParseHTML = () => {
  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to);
  
  if (selectedText) {
    // Insert the HTML as actual content
    editor.chain()
      .focus()
      .deleteSelection()
      .insertContent(selectedText)
      .run();
  }
};
```

### Solution #2: Fix Published Content Headings

**Root Cause:** The `prose` utility classes need explicit heading styles.

Add to `globals.css`:

```css
/* Ensure headings render correctly in published articles */
.prose h1, .article-content h1 {
  font-size: 2.25rem;
  font-weight: 800;
  margin: 1.5rem 0 1rem 0;
  line-height: 1.2;
  font-family: var(--font-space-grotesk);
}

.prose h2, .article-content h2 {
  font-size: 1.875rem;
  font-weight: 700;
  margin: 1.25rem 0 0.75rem 0;
  line-height: 1.3;
  font-family: var(--font-space-grotesk);
}

.prose h3, .article-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem 0;
  line-height: 1.4;
  font-family: var(--font-space-grotesk);
}
```

### Solution #3: Proper Favicon Setup

Convert PNG to ICO and use Next.js App Router convention:

1. Create `app/icon.png` or `app/favicon.ico`
2. Next.js will auto-generate all needed formats
3. Update metadata to use relative paths

---

## 📝 Implementation Steps

1. ✅ Add HTML parser button to RichTextEditor
2. ✅ Fix heading styles in globals.css
3. ✅ Setup proper favicon with ICO format
4. ✅ Test all fixes
5. ✅ Build and verify

---

**Status:** Ready to implement
