# Folder Structure Reference

Last updated: 2026-02-14

## Current `src` layout (audited)

Top-level:

- `src/app` (Next.js App Router routes/layouts)
- `src/features` (feature modules)
- `src/shared` (cross-feature code)
- `src/components` (reusable UI blocks)
- `src/hooks` (legacy/global hooks)
- `src/service` (API/service layer)

Feature folders currently in use:

- `application-detail`
- `application-form`
- `application-list`
- `auth`
- `dashboard`
- `gs`
- `notifications`
- `threads`

Shared folders currently in use:

- `shared/config`
- `shared/constants`
- `shared/data`
- `shared/hooks`
- `shared/lib`
- `shared/store`
- `shared/types`
- `shared/utils`
- `shared/validation`

## Canonical placement rules

Use this order when deciding where a file should live:

1. If code is used by exactly one feature, place it in `src/features/<feature>/...`.
2. If code is used by multiple features, place it in `src/shared/...`.
3. If it is a reusable UI building block, place it in `src/components/...`.
4. Route files stay in `src/app/...` and should import from `features`/`shared` rather than owning business logic.

## Folder responsibilities

- `src/app`: route segments, layouts, pages, route-level wrappers only.
- `src/features/<feature>/components`: feature-specific UI.
- `src/features/<feature>/hooks`: feature-specific hooks/query logic.
- `src/features/<feature>/utils`: feature-only helpers.
- `src/features/<feature>/constants`: feature-only constants/config.
- `src/shared/constants`: app-wide enums, route constants, global types/constants.
- `src/shared/config`: app-wide configuration maps/rules.
- `src/shared/data`: static cross-feature datasets.
- `src/shared/hooks`: genuinely shared hooks only.
- `src/service`: API client/service functions shared by multiple features.

## Existing duplication and direction

- `src/constants` and `src/data` have been consolidated into:
  - `src/shared/constants`
  - `src/shared/data`
- Continue this direction: do not recreate root-level `src/constants` or `src/data`.
- `src/hooks` still exists as a legacy/global area; new hooks should prefer:
  - `src/features/<feature>/hooks` (default)
  - `src/shared/hooks` (only if cross-feature)

## Import conventions

- Prefer alias imports with `@/`.
- For global constants/config/data, use:
  - `@/shared/constants/...`
  - `@/shared/config/...`
  - `@/shared/data/...`
- For domain logic, import from feature modules:
  - `@/features/<feature>/...`

## Guardrails for future PRs

- Do not add new business logic directly under `src/app`.
- Do not place feature-specific code in `src/shared`.
- Do not create parallel folders for the same concern (example: avoid both `src/shared/constants` and `src/constants`).
- Prefer small, explicit feature boundaries over generic global folders.
