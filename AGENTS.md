# AGENTS.md — Next.js Application (Feature-Based Architecture ⭐)

This document is the binding architecture reference for any AI coding agent (Cursor, Claude Code, Copilot, etc.) working in this repository. The project uses **Feature-Based Architecture**: code is organized by business domain/feature first, not by technical type. Every rule below is mandatory unless explicitly overridden by the user in a prompt.

---

## 1. Why Feature-Based Architecture

Traditional "type-based" structures (`components/`, `hooks/`, `utils/` all flat at root) fall apart as an app grows — a single feature's logic gets scattered across a dozen folders, and unrelated features accumulate hidden coupling.

Feature-Based Architecture instead groups **everything a feature needs** (UI, hooks, API calls, types, validation, state) into one self-contained folder. Benefits:

- **High cohesion, low coupling** — a feature can be understood, tested, or deleted by looking at one folder.
- **Scales horizontally** — adding a new feature never means touching a shared 1000-line `types.ts`.
- **Easier onboarding** — new devs/agents work within a feature's boundary without needing to understand the whole app.
- **Parallel development** — multiple people/agents can work on different features with minimal merge conflicts.
- **Clear ownership** — each feature folder can map to a team or a single PR.

---

## 2. Full Folder Structure

```
src/
├── app/                                  # NEXT.JS ROUTING LAYER ONLY — no business logic
│   ├── (auth)/                            # Route group: auth pages share a layout
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx                    # Imports <LoginContainer /> from features/auth
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/                        # Route group: authenticated app shell
│   │   ├── layout.tsx                       # Sidebar + navbar shell
│   │   ├── courses/
│   │   │   ├── page.tsx                      # Imports from features/courses
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   └── [courseId]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   ├── coupons/
│   │   │   └── page.tsx
│   │   └── subscriptions/
│   │       └── page.tsx
│   ├── api/                                 # Route Handlers — thin adapters only
│   │   └── webhooks/
│   │       └── stripe/route.ts
│   ├── layout.tsx                            # Root layout (providers mounted here)
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── globals.css
│   └── providers.tsx                          # QueryClientProvider, ThemeProvider, etc.
│
├── features/                                    # ⭐ THE CORE OF THE ARCHITECTURE
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── containers/
│   │   │   └── LoginContainer.tsx              # Data-fetching wrapper consumed by app/
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   └── useSession.ts
│   │   ├── api/
│   │   │   ├── auth.api.ts                      # login(), register(), logout()
│   │   │   └── queryKeys.ts
│   │   ├── schema.ts                              # Zod: loginSchema, registerSchema
│   │   ├── types.ts                                # AuthUser, Session, etc.
│   │   ├── store.ts                                 # Zustand slice (if needed)
│   │   └── index.ts                                  # Barrel export — public API of the feature
│   │
│   ├── courses/
│   │   ├── components/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── CourseList.tsx
│   │   │   ├── CourseForm.tsx
│   │   │   └── CourseFilters.tsx
│   │   ├── containers/
│   │   │   ├── CourseListContainer.tsx
│   │   │   └── CourseDetailContainer.tsx
│   │   ├── hooks/
│   │   │   ├── useCourses.ts                      # useQuery wrapper
│   │   │   ├── useCourse.ts
│   │   │   └── useCourseMutations.ts               # create/update/delete
│   │   ├── api/
│   │   │   ├── courses.api.ts
│   │   │   └── queryKeys.ts
│   │   ├── schema.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── coupons/
│   │   ├── components/
│   │   ├── containers/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── schema.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── subscriptions/
│       ├── components/
│       ├── containers/
│       ├── hooks/
│       ├── api/
│       ├── schema.ts
│       ├── types.ts
│       └── index.ts
│
├── components/                                  # TRULY GLOBAL, cross-feature UI only
│   ├── ui/                                        # Design-system primitives (shadcn-style)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── card.tsx
│   │   └── toast.tsx
│   └── layout/                                     # App shell pieces used across features
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│
├── lib/                                         # Framework-level infrastructure
│   ├── api-client.ts                              # Central fetch/Axios instance
│   ├── query-client.ts                             # React Query client config
│   ├── auth.ts                                      # NextAuth config / session helpers
│   ├── logger.ts
│   └── utils.ts                                      # cn(), formatDate(), formatCurrency()
│
├── hooks/                                       # GLOBAL reusable hooks (not feature-specific)
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   └── useLocalStorage.ts
│
├── stores/                                      # GLOBAL Zustand stores only
│   ├── useUiStore.ts                              # sidebar open/close, theme, etc.
│   └── useAuthStore.ts                             # current-user shortcut, if truly global
│
├── types/                                       # GLOBAL/shared types only
│   ├── api.ts                                     # ApiResponse<T>, PaginatedResponse<T>
│   └── common.ts
│
├── config/
│   ├── env.ts                                     # Zod-validated environment variables
│   ├── site.ts                                     # App name, metadata, nav config
│   └── constants.ts
│
└── middleware.ts                                 # Route protection / auth guards
```

---

## 3. The Anatomy of a Feature Folder

Every feature under `features/<name>/` follows this exact internal shape. Not every subfolder is required (e.g. a simple feature may skip `store.ts`), but **the ones that exist must go in the right place**.

| Folder/File | Purpose | Rule |
|---|---|---|
| `components/` | Presentational, feature-scoped UI | No data fetching. Pure props in → JSX out. |
| `containers/` | Data-fetching wrapper components | Calls hooks, passes data to `components/`. Consumed directly by `app/` pages. |
| `hooks/` | Feature-specific React Query hooks, custom logic | Wraps `api/` calls with `useQuery`/`useMutation`. |
| `api/` | Typed HTTP calls for this feature | Uses the shared `lib/api-client.ts`. Returns `Promise<ApiResponse<T>>`. |
| `schema.ts` | Zod validation schemas | Single source of truth; types inferred via `z.infer<>`. |
| `types.ts` | Feature-specific TypeScript types not derived from Zod | Domain entities, filter types, enums. |
| `store.ts` | Zustand slice, only if the feature needs local-but-shared client state | Do NOT put server data here. |
| `index.ts` | Barrel file — the feature's public interface | Other code imports **only** from here, never reaching into internal files directly. |

### Barrel export pattern (`index.ts`)

```ts
// features/courses/index.ts
export { CourseListContainer } from './containers/CourseListContainer';
export { CourseDetailContainer } from './containers/CourseDetailContainer';
export { useCourses, useCourse } from './hooks/useCourses';
export type { Course, CourseFilters } from './types';
```

**Rule:** `app/` pages and other features import via `@/features/courses`, never via deep paths like `@/features/courses/components/CourseCard`. This keeps the feature's internals free to refactor without breaking consumers.

---

## 4. Import Boundaries (Critical Rule)

Feature-Based Architecture only works if boundaries are enforced. Agents must respect this dependency direction:

```
app/          → can import from features/*, components/*, lib/*
features/X    → can import from components/*, lib/*, hooks/*, stores/*, types/*
features/X    → must NOT import from features/Y directly (see exception below)
components/   → can import from lib/*, types/* — NEVER from features/*
lib/, hooks/, stores/, types/ → must NOT import from features/* or app/*
```

**Cross-feature communication:** If `features/coupons` needs something from `features/courses` (e.g. course price to calculate a discount), do **not** import across feature folders. Instead:
- Lift the shared logic/type into `types/` or `lib/` if it's truly generic, **or**
- Pass the needed data down as props from the `app/` page or a parent container that already composes both features.

This prevents circular dependencies and keeps features independently deletable.

---

## 5. Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/app/*": ["./src/app/*"],
      "@/features/*": ["./src/features/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/types/*": ["./src/types/*"],
      "@/config/*": ["./src/config/*"]
    }
  }
}
```

Always import via aliases, never relative paths like `../../../lib/utils`.

---

## 6. Example: Wiring a Page to a Feature

```tsx
// app/(dashboard)/courses/page.tsx
import { CourseListContainer } from '@/features/courses';

export default function CoursesPage() {
  return <CourseListContainer />;
}
```

```tsx
// features/courses/containers/CourseListContainer.tsx
'use client';

import { useCourses } from '../hooks/useCourses';
import { CourseList } from '../components/CourseList';
import { CourseFilters } from '../components/CourseFilters';
import { useState } from 'react';
import type { CourseFilters as Filters } from '../types';

export function CourseListContainer() {
  const [filters, setFilters] = useState<Filters>({});
  const { data, isLoading, error } = useCourses(filters);

  if (error) return <p role="alert">Failed to load courses.</p>;

  return (
    <div className="space-y-4">
      <CourseFilters value={filters} onChange={setFilters} />
      <CourseList courses={data ?? []} isLoading={isLoading} />
    </div>
  );
}
```

```ts
// features/courses/hooks/useCourses.ts
import { useQuery } from '@tanstack/react-query';
import { getCourses } from '../api/courses.api';
import { courseKeys } from '../api/queryKeys';
import type { CourseFilters } from '../types';

export function useCourses(filters: CourseFilters) {
  return useQuery({
    queryKey: courseKeys.list(filters),
    queryFn: () => getCourses(filters),
    select: (res) => res.data,
  });
}
```

```ts
// features/courses/api/courses.api.ts
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { Course, CourseFilters } from '../types';

export async function getCourses(filters: CourseFilters): Promise<ApiResponse<Course[]>> {
  const { data } = await apiClient.get('/courses', { params: filters });
  return data;
}
```

```ts
// features/courses/api/queryKeys.ts
export const courseKeys = {
  all: ['courses'] as const,
  list: (filters?: object) => [...courseKeys.all, 'list', filters] as const,
  detail: (id: string) => [...courseKeys.all, 'detail', id] as const,
};
```

```ts
// features/courses/schema.ts
import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(3).max(120),
  price: z.number().nonnegative(),
  isPublished: z.boolean().default(false),
});
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
```

```ts
// features/courses/types.ts
export interface Course {
  id: string;
  title: string;
  price: number;
  isPublished: boolean;
  createdAt: string;
}

export interface CourseFilters {
  search?: string;
  isPublished?: boolean;
}
```

This full slice — page → container → hook → api → schema/types — is the pattern every feature must follow.

---

## 7. Server vs Client Components in a Feature

- Prefer fetching in a **Server Component container** when the data doesn't need client-side refetching/mutation (e.g. a static course detail page).
- Use a **Client Component container** (`'use client'`) with React Query when the UI needs filters, pagination, optimistic updates, or mutations.
- A feature can have both: e.g. `CourseDetailContainer` (Server Component, initial fetch) hydrating a `CourseDetailClient` (Client Component) that handles interactive edits.

```tsx
// features/courses/containers/CourseDetailContainer.tsx (Server Component)
import { getCourseServer } from '../api/courses.server';
import { CourseDetailClient } from '../components/CourseDetailClient';

export async function CourseDetailContainer({ courseId }: { courseId: string }) {
  const course = await getCourseServer(courseId);
  return <CourseDetailClient initialCourse={course} />;
}
```

---

## 8. Testing Structure (mirrors feature folders)

```
features/courses/
├── components/CourseCard.tsx
├── components/CourseCard.test.tsx        # colocated unit test
├── hooks/useCourses.ts
├── hooks/useCourses.test.ts
└── schema.ts
    schema.test.ts
```

Tests live **next to** the file they test, inside the feature folder — not in a separate mirrored `__tests__/` tree at root. E2E tests (Playwright) live in a top-level `e2e/` folder organized by user flow, since they cross feature boundaries.

---

## 9. Hard Rules for Agents (Do / Don't)

**Do:**
- Create a full feature slice (`components/containers/hooks/api/schema/types/index.ts`) for any new domain concept.
- Import features only via their `index.ts` barrel file.
- Keep `app/` folders limited to routing + composition — zero business logic.
- Default to Server Components; add `'use client'` only where interactivity is required.
- Put genuinely shared UI in `components/ui` or `components/layout`, never duplicate it inside a feature.

**Don't:**
- Don't let one feature import another feature's internals directly.
- Don't put feature-specific types in the global `types/` folder — only truly shared types (e.g. `ApiResponse<T>`) belong there.
- Don't create a flat `components/`, `hooks/`, `utils/` dumping ground at `src/` root for feature-specific code.
- Don't fetch data with a raw `useEffect` when a React Query hook or Server Component fetch would work.
- Don't skip the `index.ts` barrel — deep-path imports break encapsulation.

---

## 10. Checklist — Adding a New Feature

1. `mkdir src/features/<name>` with `components/ containers/ hooks/ api/`.
2. Write `schema.ts` first (Zod) — this drives your types.
3. Write `types.ts` for anything not covered by Zod inference.
4. Write `api/<name>.api.ts` using `lib/api-client.ts`, returning `ApiResponse<T>`.
5. Write `api/queryKeys.ts`.
6. Write `hooks/use<Name>.ts` (`useQuery`) and `hooks/use<Name>Mutations.ts` (`useMutation`).
7. Build presentational `components/` (no logic).
8. Build a `containers/<Name>Container.tsx` that wires hooks → components.
9. Export the public surface via `index.ts`.
10. Wire the route in `app/` — import only from `@/features/<name>`.
11. Add `loading.tsx`/`error.tsx` for the route segment.
12. Add colocated tests for schema + hook + one component.