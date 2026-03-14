## 2025-05-14 - [Image Optimization & Component Memoization]
**Learning:** Raw `<img>` tags in Next.js bypass the built-in image optimization pipeline, leading to larger layout shifts and unoptimized delivery. Wrapping frequently-rendered list items like `ArticleCard` in `React.memo` and memoizing derived computations like reading time prevents redundant re-renders when the article list updates (e.g., during filtering).
**Action:** Always prefer the project's `OptimizedImage` component over raw `<img>` tags and apply `React.memo` to reusable UI cards used in large lists.

## 2026-03-14 - [N+1 Query Optimization in ArticleService]
**Learning:** Fetching tag translations individually for each article in a list resulted in an N+1 query problem, significantly slowing down article list retrieval. By collecting unique tag IDs and batch-fetching translations in a single database call, queries are reduced from N+1 to 2.
**Action:** Always check for N+1 patterns in service methods that process lists, and use batch fetching with Maps for efficient data association.
