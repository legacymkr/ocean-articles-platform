## 2025-05-14 - [Image Optimization & Component Memoization]
**Learning:** Raw `<img>` tags in Next.js bypass the built-in image optimization pipeline, leading to larger layout shifts and unoptimized delivery. Wrapping frequently-rendered list items like `ArticleCard` in `React.memo` and memoizing derived computations like reading time prevents redundant re-renders when the article list updates (e.g., during filtering).
**Action:** Always prefer the project's `OptimizedImage` component over raw `<img>` tags and apply `React.memo` to reusable UI cards used in large lists.

## 2025-05-15 - [Eliminating N+1 Queries in Prisma Services]
**Learning:** Fetching related data (like tag translations) within loops using individual database queries creates an N+1 performance bottleneck. Using Prisma's nested `include` with filtered relations allows fetching all necessary data in a single database round-trip.
**Action:** Always prefer nested `include` blocks with relevant filters over manual fetching in loops. Use synchronous helper methods to format pre-fetched data.
