# `santosh` Branch Notes

This document summarizes what is different in the `santosh` branch compared with `main`.

## Overview

The branch adds three major areas of work:

1. Agent-only settings pages
2. Sub-agent/team management
3. Application list/detail updates to support sub-agent visibility and cleaner navigation/build behavior

There are also a few build and infrastructure adjustments that are not present on `main`.

## 1. Agent-Only Settings Area

New files:

- `src/app/dashboard/settings/layout.tsx`
- `src/app/dashboard/settings/page.tsx`
- `src/app/dashboard/settings/profile/page.tsx`
- `src/app/dashboard/settings/sub-agents/page.tsx`
- `src/service/agent-profile.service.ts`

Behavior added in this branch:

- Introduced a dedicated `/dashboard/settings` section with its own left-side settings navigation.
- Added an agent profile page that reads the current authenticated user and allows updates through role-based APIs.
- Added a sub-agent settings page that mounts the new sub-agent management UI.
- Added `agentProfileService.updateCurrentAgentProfile()` for agent profile updates.
- Added `authService.updateCurrentUser()` for generic account updates.

Role/access changes:

- Settings is now intended to exist only inside the agent portal.
- The settings layout checks the current session role client-side and redirects non-agents back to `/dashboard`.
- The proxy now treats `/dashboard/settings` as an agent-only path.

Files involved:

- `src/proxy.ts`
- `src/shared/data/navlink.data.ts`
- `src/shared/constants/site-routes.ts`
- `src/service/auth.service.ts`
- `src/service/agent-profile.service.ts`

## 2. Sidebar and Route Changes

Files changed:

- `src/shared/constants/site-routes.ts`
- `src/shared/data/navlink.data.ts`
- `src/features/dashboard/components/sidebar-nav.tsx`
- `src/proxy.ts`

Differences from `main`:

- Removed the old `/dashboard/agents` route structure from shared route config and introduced:
  - `/dashboard/settings`
  - `/dashboard/settings/profile`
  - `/dashboard/settings/sub-agents`
- Added `siteRoutes.dashboard.application.filteredBySubAgent(subAgentId)`.
- Added `Settings` to the agent navigation.
- Removed `Settings` from staff navigation.
- Proxy access rules were updated so:
  - `/dashboard/settings/**` is agent-only
  - `/dashboard/tasks` remains staff-only
  - non-agents are redirected away from settings routes

## 3. Sub-Agent Management Feature

New files:

- `src/features/agents/components/agents-page.tsx`
- `src/features/agents/components/agents-table-columns.tsx`
- `src/features/agents/components/create-sub-agent-dialog.tsx`
- `src/features/agents/components/update-sub-agent-credentials-dialog.tsx`
- `src/features/agents/components/update-sub-agent-password-dialog.tsx`
- `src/features/agents/components/sub-agent-application-badge.tsx`
- `src/features/agents/hooks/useSubAgents.hook.ts`
- `src/features/agents/utils/sub-agent.validation.ts`
- `src/features/agents/utils/sub-agent-application-preview.ts`
- `src/service/sub-agents.service.ts`

What this branch adds:

- A full sub-agent management screen for agents.
- Team member fetching from `agents/team`.
- Create sub-agent flow.
- Activate/deactivate sub-agent actions.
- Update sub-agent profile flow.
- Reset/update sub-agent password flow.
- Validation schemas for sub-agent create/profile/password/credentials operations.
- Shared UI badge to identify which sub-agent processed an application.

Important behavior differences from `main`:

- `main` does not have a dedicated sub-agent management feature in the dashboard settings area.
- This branch adds explicit sub-agent hierarchy awareness to the UI.
- The sub-agent preview logic now only shows real matches from `agent_profile_id`; the temporary mock/fallback assignment behavior has been removed.

## 4. Application List: Sub-Agent Filtering and Hierarchy Support

Files changed:

- `src/service/application.service.ts`
- `src/features/application-list/hooks/useApplications.hook.ts`
- `src/app/dashboard/application/(list)/list-page.tsx`

What changed versus `main`:

- `ApplicationListParams` was extended with:
  - `scope`
  - `ownerAgentProfileId`
- Application service now supports two list paths:
  - Legacy/general list: `applications`
  - Hierarchy list: `agents/applications`
- Query building is split into:
  - `buildLegacyQuery()`
  - `buildHierarchyQuery()`
- New method:
  - `listHierarchyApplications()`

Current list behavior in this branch:

- General staff/admin/application list access still uses the original `applications` endpoint.
- Hierarchy/sub-agent specific filtering uses `agents/applications`.
- The hook switches to the hierarchy API only when `ownerAgentProfileId` or `scope` is explicitly present.

UI additions:

- The application list page reads `subAgentId` and `subAgentName` from the URL.
- When present, the page shows a sub-agent filter banner/chip and loads the filtered results dynamically.
- Reset/Clear actions also clear the URL-based sub-agent filter.

Why this matters:

- This branch originally moved listing behavior too far toward the hierarchy endpoint.
- It was corrected so staff/admin access remains aligned with `main`, while the hierarchy endpoint is only used for the sub-agent use case.

## 5. Application Table and Kanban Navigation Improvements

Files changed:

- `src/components/data-table/data-table.tsx`
- `src/features/application-list/components/kanban/application-card.tsx`

Differences from `main`:

- Table rows now guard navigation more carefully:
  - only navigate if a usable application id is present
  - use a non-navigable hover style otherwise
- Kanban cards now navigate to the application detail page when the full card is clicked, not just the small `View` button.
- Keyboard navigation was added for kanban cards (`Enter` / `Space`).
- The nested `View` link stops propagation so it does not trigger duplicate navigation.

Practical result:

- Application detail access is more consistent between table view and kanban view than in `main`.

## 6. Application Detail Page: “Processed By” Sub-Agent Context

Files changed:

- `src/app/dashboard/application/[id]/client-layout.tsx`
- `src/features/application-detail/components/layout/application-header-details.tsx`

What changed:

- The detail layout now passes:
  - `applicationRecordId`
  - `agentProfileId`
- The header details component uses the sub-agent team data and preview resolver to show a `Processed By` row.
- If no matching sub-agent exists, it falls back to `Primary agent`.

Difference from `main`:

- `main` does not surface sub-agent processing context in the application header.

## 7. Application List Columns: “Processed By”

Files changed:

- `src/features/application-list/components/table/application-table-columns.tsx`
- `src/features/application-list/components/kanban/application-card.tsx`
- `src/shared/constants/types.ts`

What changed:

- Added `agentId?: string` to `ApplicationTableRow`.
- Added a new `Processed By` column in the table view.
- Kanban cards now also display the sub-agent badge when the application belongs to a matched sub-agent.

Difference from `main`:

- `main` does not carry `agentId` through the normalized application row model or render this sub-agent ownership context.

## 8. Build and Rendering Fixes Added in This Branch

Files changed:

- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/shared/components/ui/avatar.tsx`
- `src/components/ui/avatar.tsx`
- `src/app/dashboard/application/(list)/page.tsx`
- `src/app/dashboard/application/(list)/archived/page.tsx`

Build-related differences from `main`:

- Removed `next/font/google` usage for `Geist` and `Geist Mono` from the root layout.
- Added local/system fallback CSS variables for `--font-geist-sans` and `--font-geist-mono`.
- This avoids build-time failures when Google Fonts cannot be fetched.

Other fixes:

- Added `Suspense` wrappers around the application list entry pages to satisfy Next.js requirements when `useSearchParams()` is used by the client list page.
- Added/fixed avatar components:
  - `src/components/ui/avatar.tsx`
  - `src/shared/components/ui/avatar.tsx`
- Fixed the shared avatar import path to use `@/shared/lib/utils`.

Result:

- The branch now builds successfully in an environment where font fetching is unavailable.

## 9. Miscellaneous Files Added or Changed

### `docs/SYSTEM.md`

- Added a large project/system documentation file that is not present on `main`.

### `.gitignore`

- Stopped ignoring the entire `/docs` directory, allowing docs files to be tracked.

### `package.json`

- Added `radix-ui` as a dependency.

### `update.js`

- Added a local utility script that rewrites a section of `agents-page.tsx`.
- This appears to be a one-off local helper and is not part of the runtime app behavior.

## 10. Summary by Intent

Compared with `main`, this branch introduces:

- A new agent-only settings area
- A full sub-agent/team management workflow
- Sub-agent-aware application filtering and presentation
- Better application detail navigation from kanban cards
- Agent-only protection for settings routes
- Build-hardening fixes for fonts and `useSearchParams()` prerendering

## 11. Files Most Important to Review

If someone is reviewing this branch against `main`, these are the most important files to inspect first:

- `src/service/application.service.ts`
- `src/features/application-list/hooks/useApplications.hook.ts`
- `src/app/dashboard/application/(list)/list-page.tsx`
- `src/app/dashboard/settings/layout.tsx`
- `src/app/dashboard/settings/profile/page.tsx`
- `src/features/agents/components/agents-page.tsx`
- `src/service/sub-agents.service.ts`
- `src/proxy.ts`
- `src/shared/data/navlink.data.ts`
- `src/app/layout.tsx`

