## 2025-05-14 - [Image Optimization & Component Memoization]
**Learning:** Raw `<img>` tags in Next.js bypass the built-in image optimization pipeline, leading to larger layout shifts and unoptimized delivery. Wrapping frequently-rendered list items like `ArticleCard` in `React.memo` and memoizing derived computations like reading time prevents redundant re-renders when the article list updates (e.g., during filtering).
**Action:** Always prefer the project's `OptimizedImage` component over raw `<img>` tags and apply `React.memo` to reusable UI cards used in large lists.

## 2025-05-15 - [N+1 Query Elimination with Prisma Joins]
**Learning:** Fetching related data (like tag translations) within a loop in a Prisma service creates an N+1 query bottleneck, especially for article lists. Using nested `include` blocks with filtered relations allows Prisma to fetch all necessary data in a single database round-trip (leveraging `relationJoins` if enabled).
**Action:** Prefer using deeply nested `include` statements in Prisma services to pre-fetch related translations and implement synchronous mapping helpers (like `formatTags`) to process the results. Always call static methods using the class name (e.g., `ArticleService.formatTags()`) to avoid runtime scope issues.
