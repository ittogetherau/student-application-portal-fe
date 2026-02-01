# AI Agent Plan: Codebase Deep Read → Refactor Analysis & Plan Output

## 0) Mission

Read the entire repository as a system. Produce an in-depth refactor plan (no code changes) covering:

* Target folder/file structure
* Module boundaries and ownership
* Redundancy removal strategy
* Dependency and import discipline
* Naming conventions
* Migration sequencing (safe, staged)
* Risk, effort, and validation strategy

Deliverables must be concrete: proposed paths, what moves where, what gets merged/split, what is deprecated, and why.

---

## 1) Inputs the Agent Must Collect

### 1.1 Repo inventory

* Full tree (all folders/files)
* Size metrics: file count, LOC per folder, biggest files
* Language/framework detection (per folder)
* Build/run entrypoints and scripts
* Lint/format/test configs
* CI configs
* Environment configs (.env templates, config loaders)

### 1.2 Architectural surfaces

* App entrypoints (web/server/cli)
* Routing definitions
* Feature modules (if any)
* Shared utilities
* Services layer (API clients, DB access)
* State management (if frontend)
* UI component libraries (if frontend)
* Domain models/types/schemas
* Validation layer
* Error handling patterns
* Logging patterns

### 1.3 Dependency graph

* Package manager lockfiles
* Dependency list and versions
* Internal import graph:

  * top coupling hotspots
  * circular deps
  * modules with high fan-in/fan-out
* Runtime deps vs dev deps separation

### 1.4 Code quality signals

* Duplicated code clusters (exact and near-duplicate)
* Dead code candidates (unreferenced exports, unused files)
* Large “god files” and “god folders”
* Mixed concerns (UI + data + domain in same module)
* Inconsistent naming (folder/file/class/function)
* Inconsistent error handling/return types
* Inconsistent async patterns
* Inconsistent types/interfaces/schema duplication

---

## 2) Reading Strategy (How the Agent Traverses)

### 2.1 Pass 1 — Map

* Generate a normalized repository map:

  * “What exists” and “what it claims to do”
* Identify the main execution flows:

  * startup path
  * request/response or render pipeline
  * background jobs (if present)

### 2.2 Pass 2 — Trace flows

Pick top critical flows and trace end-to-end:

* Auth/session flow
* One representative CRUD feature
* One complex feature (search, payments, analytics, realtime, etc.)
* Error flow (how failures propagate)
* Data validation flow

Output: flow diagrams in text form (sequence lists).

### 2.3 Pass 3 — Cluster into domains/features

* Partition code into:

  * domain modules
  * feature modules
  * shared cross-cutting modules
  * infrastructure/adapters
* Detect mismatch between current structure and natural boundaries.

### 2.4 Pass 4 — Identify redundancy and tight coupling

* Compute:

  * duplicate functions/utilities
  * repeated API calls and DTOs
  * repeated UI patterns/components
  * repeated validation schemas
  * repeated constants/enums
* Produce “redundancy groups” with file paths.

---

## 3) Classification Model the Agent Must Use

Every file must be tagged with one of these categories (or “unknown” with reason):

* **app** (entrypoints, bootstrapping)
* **feature** (end-user functionality grouped by domain capability)
* **domain** (business rules, entities, value objects)
* **data** (repositories, DB queries, API adapters)
* **ui** (presentational components)
* **shared** (generic utilities, helpers)
* **infra** (logging, config, monitoring, integrations)
* **tests**
* **scripts/tools**
* **docs**

This classification becomes the basis for folder refactor.

---

## 4) Refactor Plan Output Requirements

The agent must produce a plan with these sections.

### 4.1 Executive architecture summary

* Current architecture style (explicitly inferred)
* Key boundaries and violations
* Primary tech stack and runtime composition

### 4.2 Proposed target structure (folder + file layout)

Provide a target tree

Must include:

* rules for what belongs where
* naming conventions for folders/files
* import boundary rules (what may import what)

### 4.3 Mapping: current → target

A table-style mapping (text acceptable) listing:

* current path
* target path
* action type: move / split / merge / rename / deprecate
* rationale (one line)
* risk level

### 4.4 Redundancy management plan

Output must include:

* Redundancy groups:

  * Group name
  * repeated pattern description
  * file list
  * single “canonical” location in target structure
* Standardization decisions:

  * where constants live
  * where schema/types live
  * where API client wrappers live
  * where UI primitives live
  * where hooks/helpers live (if React)

### 4.5 Dependency and coupling plan

* Circular dependency resolution strategy
* High fan-in module stabilization:

  * which modules become “core”
  * which modules get split
* Public API surfaces:

  * index/barrel rules (if used)
  * allowed re-export patterns

### 4.6 Consistency plan (system-wide rules)

Must define rules for:

* naming
* error handling pattern (one standard)
* logging usage
* config access (single mechanism)
* validation placement
* typing strategy (if TS) or interfaces (if other languages)
* test organization & coverage expectations

### 4.7 Migration sequencing (no code changes, but ordered plan)

Staged milestones with:

* Stage name
* Scope (what folders/features)
* Expected file movement list
* Validation steps (build, tests, lint, typecheck)
* Rollback approach

### 4.8 Risk register

* top structural risks
* mitigation
* “do not touch first” areas

### 4.9 Concrete “Definition of Done” for the refactor plan

Even though no refactor is executed, the plan must define:

* measurable outcomes:

  * reduced duplicate clusters count
  * reduced circular deps
  * reduced average file size in hotspots
  * improved module boundary adherence
* checks to validate after refactor is implemented later.

---

## 5) Agent Output Format (Strict)

### 5.1 Required artifacts

1. `ARCHITECTURE_SUMMARY.md`
2. `TARGET_STRUCTURE.md` (includes target tree + boundary rules)
3. `MAPPING_CURRENT_TO_TARGET.md`
4. `REDUNDANCY_REPORT.md`
5. `DEPENDENCY_COUPLING_REPORT.md`
6. `MIGRATION_STAGES.md`
7. `RISK_REGISTER.md`

### 5.2 Each artifact must include

* Timestamp of analysis
* Repo commit hash (or “unknown” if not available)
* Scope statement (what was read)
* Assumptions list

---

## 6) Heuristics the Agent Must Apply While Analyzing

### 6.1 “Single-responsibility pressure”

Flag modules that combine:

* UI + data fetching
* domain rules + persistence
* config + runtime logic
* services + controllers + formatting

### 6.2 “Boundary violations”

Any import from:

* feature → another feature’s internals
* ui → data
* domain → infra
  Must be documented with file paths.

### 6.3 “Duplication thresholds”

Identify:

* exact duplicates (hash match)
* near duplicates (similar AST/text)
* semantic duplicates (same purpose different implementation)
  Output the top 20 duplication clusters.

### 6.4 “Public surface policy”

Define which folders are allowed to expose public APIs and which are internal-only.

---

## 7) Agent Checklist

* [ ] Full repo tree captured
* [ ] Entrypoints identified
* [ ] Core flows traced end-to-end
* [ ] Every file categorized
* [ ] Dependency graph produced
* [ ] Circular deps listed
* [ ] Redundancy clusters listed
* [ ] Target structure proposed
* [ ] Current→Target mapping completed
* [ ] Migration stages defined
* [ ] Risks and mitigations documented
* [ ] Deliverables generated as markdown files
