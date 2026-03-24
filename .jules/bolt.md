## 2025-05-14 - [Image Optimization & Component Memoization]
**Learning:** Raw `<img>` tags in Next.js bypass the built-in image optimization pipeline, leading to larger layout shifts and unoptimized delivery. Wrapping frequently-rendered list items like `ArticleCard` in `React.memo` and memoizing derived computations like reading time prevents redundant re-renders when the article list updates (e.g., during filtering).
**Action:** Always prefer the project's `OptimizedImage` component over raw `<img>` tags and apply `React.memo` to reusable UI cards used in large lists.

## 2025-05-15 - [Batching Localized Relations in Prisma]
**Learning:** Fetching localized translations (like `TagTranslation`) in a loop creates an N+1 query bottleneck. While Prisma's `relationJoins` preview feature is enabled, manually filtering relations within an `include` block allows fetching exactly one translation per record in a single database round-trip.
**Action:** To eliminate N+1 query bottlenecks in Prisma services, prefer using nested `include` statements with filtered relations (e.g., within `findMany`) over manual batching with `Map` to fetch related data in a single database round-trip.
