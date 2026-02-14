# AGENT OBSERVATIONS

## Summary of Changes
- Re-architected `/dashboard/application/[id]/*` to be route-driven instead of tab-driven, adding a route-group (`(application-pages)`), per-route clients, and centralized UUID validation via `ensureValidApplicationId`.
- Built a persistent client layout (`_components/client-layout.tsx`) that now uses `siteRoutes.dashboard.application.id.*` helpers to compute nav links, stage buttons, and action buttons, keeping shared UI (header/sidebar) intact.
- Updated `site-routes.ts` to expose every `id` sub-route (details, documents, timeline, communication, GS, COE, root) and rewired all callers (redirect page, GS/COE guards, nav links, Kanban/action cards, tasks table) to rely solely on those helpers.
- Reworked GS/COE client guards, COE tab navigation, communication thread links, and the GS assessment form to use the canonical helpers and new path structure while maintaining Nuqs/query behavior.
- Created `AGENT.md` here as requested to capture the work for future reference.

## Instructions for Future Work
1. **Follow the canonical route helpers** (`siteRoutes.dashboard.application.id.*`) whenever wiring new `/dashboard/application/[id]/*` navigation so path logic stays centralized.
2. **Respect async params + UUID guard**: every new route or layout must accept `params: Promise<{ id: string }>` and call `ensureValidApplicationId(id)` before doing anything else.
3. **Avoid inline service/state changes in server layers**; place fetching in client components/hooks as already done through TanStack Query.
4. **Stage-gated routing**: GS/COE pages guard themselves client-side and reroute to `details` if stage conditions fail; keep this pattern consistent, no middleware/global guard.

# Application Stage Config Rules
- Use `src/shared/config/application-stage.config.ts` as the single source of truth for application stage metadata.
- Do not redefine stage labels, role labels, stage colors, stage backgrounds, stage icons, or kanban stage order in feature files.
- For labels:
  - Use `getStageLabel(stage, role?)` for display.
  - Use `getRoleStageLabel(stage, role)` when role-specific wording is required.
- For visuals:
  - Use `getStageKanbanColor(stage)` and `getStageKanbanBackground(stage)` for kanban columns.
  - Use `STAGE_PILL_CONFIG[stage]` for stage pill styling.
  - Use `getStageIcon(stage)` for stage icons.
- For stage normalization:
  - Use `normalizeStage(value)` from the shared config.
- Any stage metadata change must be made in the shared config only and consumed everywhere else.

## UI Composition Rule
- Use `cn` from `@/shared/lib/utils` for className composition instead of manual array joins.
