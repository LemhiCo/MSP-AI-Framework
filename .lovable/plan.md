

# MAGIC Framework v3 Migration Plan

## What Changed in the Data

The framework has been restructured from 8 content-area columns to a 5-pillar implementation model with 9 content areas nested underneath. The CSV schema has significantly changed:

- **New columns**: `Implementation Pillar`, `Criticality Level`, `Content Area`
- **Removed columns**: `ELI5`, `Microsoft Tool Recommendation`, `Generic Tooling Category`, `Raw Weight`, `Gate Type`, `Applies To`, `End Customer Business Value`, `Customer Conversation Track`, and all 5 `Relevant: *` flags
- **`First Required When`** now holds a single AI modality label (GenAI, Cowork, Custom GPTs, Agentic AI) instead of separate Yes/No columns
- **New lifecycle triggers** appear (e.g., "Employee Onboarding; Capability Deployment" — semicolon-separated)
- **120 controls** across 5 pillars instead of the previous ~70 across 8

The 5 pillars (from the overview CSV):

| # | Name | Criticality | Activate When |
|---|------|-------------|---------------|
| 1 | Critical Foundation | Critical | Before any AI tool is enabled |
| 2 | Platform Prerequisites | High | Before M365 Copilot or first custom agent goes live |
| 3 | Operational Governance | Medium-High | Once AI is live and actively managed |
| 4 | Advanced Configuration | Medium | When building custom agents or advanced hardening |
| 5 | Agentic Enterprise Readiness | Advanced / Specialized | When enabling autonomous agentic AI |

## Implementation Steps

### 1. Replace the controls CSV in the repo
Copy the new `MAGIC-Framework-v3_Export_CSV-Ready.csv` to `public/data/controls.csv` so the local copy matches what will be pushed to GitHub.

### 2. Update `csv-loader.ts` — schema and constants
- Update the `Control` interface: remove `eli5`, `microsoftTool`, `genericTooling`, `rawWeight`, `gateType`, `appliesTo`, `endCustomerBusinessValue`, `customerConversationTrack`, `relevantGenAI`, `relevantCustomGPTs`, `relevantAgenticAI`, `relevantDigitalWorkers`, `relevantCowork`. Add `implementationPillar`, `criticalityLevel`, `contentArea`.
- Update `mapControlRow` to map from the new CSV headers (`Implementation Pillar`, `Criticality Level`, `Content Area`).
- Replace `PILLARS` array with the 5 new implementation pillars (with new IDs like `P1`–`P5`, names, criticality, and colors).
- Add a `CONTENT_AREAS` constant for the 9 content areas (STR, GOV, TEC, CPL, PRC, DAT, OBS, DEP, SKL) so control IDs still resolve to a content area color/dot.
- Remove `AI_MODALITIES` (no longer separate flags) — `firstRequiredWhen` is now a single value.
- Update `LIFECYCLE_TRIGGERS` to include any new triggers from the data.
- Remove `Gate Type`-related constants.

### 3. Update `FrameworkBadges.tsx`
- Update `IGBadge` — still works (IG1/2/3 unchanged).
- Update `PillarDot` to work with content area IDs (from control ID prefix) rather than pillar IDs.
- Add a `PillarBadge` component for the 5 implementation pillars with criticality-based coloring.

### 4. Update the Kanban grid in `Index.tsx`
- The Kanban columns should now represent the **5 implementation pillars** (not 8 content areas).
- Within each pillar column, controls are still grouped by IG level (rows).
- Each control card should show the content area prefix and the `firstRequiredWhen` modality tag instead of the old gate type badge.
- Remove the Copilot toggle (Copilot Readiness is no longer a standalone optional column — it's part of Pillar 2/5).
- Update filter chips: remove "Gate Type" filter, replace "AI Type" filter with a "First Required When" / modality filter using unique values from the data.
- Update XLSX download to use new column names.
- Update `IG_META` labels if desired (still IG1/2/3).
- Update `PILLAR_COLORS` to have 5 pillar colors instead of 8.

### 5. Update `ControlDetailPanel.tsx`
- Remove fields for deleted columns (ELI5, Microsoft Tool, Generic Tooling, Raw Weight, Gate Type, Applies To, End Customer Business Value, Customer Conversation Track, all Relevant flags).
- Add display for `implementationPillar`, `criticalityLevel`, `contentArea`.
- Update `SELECT_FIELDS` — remove old options, add new ones.
- Update `TEXTAREA_FIELDS` — remove `eli5`, `endCustomerBusinessValue`, `customerConversationTrack`.

### 6. Update `Admin.tsx`
- Update `EMPTY_CONTROL` template with new fields, remove old ones.
- Update `controlToCSVRow` mapping for export.
- Update the Kanban grid to use 5 pillars.
- Update `PILLAR_COLORS`.

### 7. Update mobile components
- `MobileControlList.tsx` — use 5 pillars, update `PILLAR_COLORS`.
- `MobileFilterSheet.tsx` — remove AI modality filter (or replace with `firstRequiredWhen` filter), remove gate type references if needed.
- `MobileDetailSheet.tsx` — update displayed fields.

### 8. Update `DashboardOverview.tsx`
- Update description text ("Five pillars, three implementation groups, N safeguards").
- Update pillar breakdown to show 5 pillars.

### 9. Update `RoadmapView.tsx` and `ControlsBrowser.tsx`
- Update references to old pillar structure and removed fields.
- Update filter options.

### 10. Update CSS variables
- In `index.css`, replace/add pillar color variables for the 5 new pillars (can keep content area colors for dots).

## Technical Details

**New `Control` interface fields:**
```
implementationPillar: string;  // "Pillar 1 — Critical Foundation"
criticalityLevel: string;      // "Critical", "High", "Medium-High", etc.
contentArea: string;            // "AI Observability", "People & Skills", etc.
```

**New `PILLARS` constant (5 pillars):**
```
P1: "Critical Foundation" — Critical
P2: "Platform Prerequisites" — High
P3: "Operational Governance" — Medium-High
P4: "Advanced Configuration" — Medium
P5: "Agentic Enterprise Readiness" — Advanced / Specialized
```

**Content areas** (derived from control ID prefixes): STR, GOV, TEC, CPL, PRC, DAT, OBS, DEP + new "People & Skills" controls that use DEP prefix but have a different Content Area value.

**Kanban mapping**: Controls are assigned to pillar columns via their `implementationPillar` field (not by control ID prefix anymore), since the same prefix (e.g., DEP) can appear across multiple pillars.

