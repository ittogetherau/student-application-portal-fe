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
