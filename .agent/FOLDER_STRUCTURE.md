# Suggested Folder Structure

## Current Landscape

- `src/app` continues to govern Next.js routes, but shared UI/hooks/logic are scattered across sibling directories (`hooks/`, `components/`, `lib/`, `data/`, `service/`), which dilutes ownership and makes it harder to reason about a specific feature (e.g., `application` vs. `tasks`).  
- Many feature-specific hooks (such as `useApplicationGetQuery`, `useStaffMembers`, `usePlacesAutocomplete`) live at the top-level `hooks/` folder with other unrelated helpers, so tracing dependencies requires jumping between disparate folders.  
- Constants, validators, and API services are flattened at the root, creating tight coupling between every feature and the shared folder; there is no explicit namespace for “dashboard feature X”.

## Key Principles for Reorganization

1. **Feature folders**: Group components, hooks, utils, and styles around a single domain or flow (e.g., application management, task inbox, GS process).  
2. **Shared modules**: Reserve `shared/` or `lib/` for genuine cross-cutting pieces (UI primitives, formatting helpers, API clients).  
3. **App router stays in `src/app`**: Keep Next.js folders for routing/layout, but wire them to feature modules rather than importing directly from broad `hooks/`/`components/`.

## Suggested Structure

```
src/
├── app/                         # Next.js route groups + layouts (existing)
│   └── dashboard/
│       └── application/          # keep route/layout clients, redirect shells
├── features/
│   ├── application/
│   │   ├── components/           # UX fragments reused within the feature
│   │   ├── hooks/                # React Query hooks scoped to applications
│   │   ├── utils/                # stage utils, URLs, validation helpers
│   │   └── pages/                # rerouted entry points if needed
│   ├── tasks/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── helpers/
│   └── communication/
│       └── ...
├── shared/
│   ├── components/               # UI kit, buttons, cards, layout helpers
│   ├── hooks/                    # truly shared hooks (nuqs, session)
│   ├── constants/                # site routes, types, enums for entire app
│   └── utils/                    # formatting, validation utilities
├── services/                     # API clients (application.service, signature.service)
├── store/                        # Zustand stores, if shared
├── data/                         # static nav data, fixtures
├── lib/                          # formatting functions reused across features
└── validation/                   # zod schemas kept per feature when necessary
```

## How This Helps

- **Easier onboarding**: Developers can jump into `features/application` to see everything required for that flow rather than hunting in `components/`, `hooks/`, and `lib/`.  
- **Scoped imports**: Route files under `src/app/dashboard/application` would import from `@/features/application/...`, making dependencies explicit and preventing accidental leakage from unrelated features.  
- **Reduced noise**: Shared folders (like the proposed `shared/constants`) remain lean; feature-specific enums/types live next to their logic, while truly global constants stay in one place.  
- **Evolution ready**: As new features (e.g., `gs`, `coe`, `students`) arrive, they simply get their own `features/<name>` folder, keeping the repo tidy.
