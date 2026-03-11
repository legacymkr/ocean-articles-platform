## 2025-07-23 - Image Utility and List Component Optimization

**Learning:**
Synchronous operations like Canvas manipulation and JPEG encoding for blur placeholders (`generateBlurPlaceholder`) can become a significant performance bottleneck when rendering lists of images. Similarly, non-memoized regex operations in list items (`readingTime` calculation) cause unnecessary CPU churn during re-renders.

**Action:**
1. Always cache expensive utility outputs (like base64 placeholders) when the inputs (SRC/dimensions) are stable.
2. Use `React.memo` for leaf components in long lists and `useMemo` for any string parsing or regex calculations within those components.
3. Prefer Next.js `Image` component (wrapped in a reusable `OptimizedImage`) over standard `<img>` tags to leverage built-in lazy loading and automatic resizing.
