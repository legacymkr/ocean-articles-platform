## 2025-05-14 - [Image Optimization & Component Memoization]
**Learning:** Raw `<img>` tags in Next.js bypass the built-in image optimization pipeline, leading to larger layout shifts and unoptimized delivery. Wrapping frequently-rendered list items like `ArticleCard` in `React.memo` and memoizing derived computations like reading time prevents redundant re-renders when the article list updates (e.g., during filtering).
**Action:** Always prefer the project's `OptimizedImage` component over raw `<img>` tags and apply `React.memo` to reusable UI cards used in large lists.

## 2025-05-20 - [N+1 Query Elimination in ArticleService]
**Learning:** Fetching article tags and their translations in a separate loop after retrieving articles created an N+1 query bottleneck. Prisma's `include` block with nested `translations` filters allows for single-query retrieval of articles and their correctly-translated tags.
**Action:** To eliminate N+1 query bottlenecks in Prisma services, prefer using nested `include` statements with filtered relations (e.g., within `findMany`) over manual async loops or post-query fetching. Use a synchronous helper method to format the results in memory.
