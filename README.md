# AI Controls Framework CSV

This repository contains the source CSV for the **AI Controls Framework**, an open source community project for defining, reviewing, and improving practical AI governance controls across customer environments.

The framework is designed to help MSPs, advisors, and internal IT teams operationalize AI readiness in a structured way across pillars such as strategy, governance, technical readiness, Copilot readiness, process, data, observability, and deployment.

## What this is

This CSV is the canonical source for the framework. It powers the web application at:

**[framework.elkhmi.ai](https://framework.elkhmi.ai)**

The webapp provides a visual way to browse, review, and edit controls without needing to work directly in raw CSV format.

This is an **open source community project**. Anyone can review the framework, suggest improvements, and contribute updates.

---

## Free access

You can access the framework **for free** through the webapp.

If you are sent to the registration page, the project includes a review-mode bypass for community access. Use the review query flag configured for the site to enter review mode and access the framework without registration.

If you are sharing this README internally, include the exact review URL your deployment is using.

---

## Visual reference

The framework is also available in a visual editor experience inside the app.

**App / UI reference:** `Admin — Controls Editor`

In the UI, controls are grouped by pillar and implementation group, and contributors can make edits directly in the admin editor, then export a revised CSV for contribution.

You should see an interface with pillars such as:

- STR
- GOV
- TEC
- Copilot Readiness
- PRC
- DAT
- OBS
- DEP

Along with actions like:

- **New Control**
- **Copilot**
- **Save CSV**

If you are using **Copilotive**, the framework includes a **Copilot-specific control pillar** intended for MSPs using Copilotive to assess and operationalize Microsoft Copilot readiness.

---

## How to review the framework

There are two ways to review the framework:

### 1. In the webapp
Go to **framework.elkhmi.ai** and browse the framework visually by pillar and implementation group.

This is the best way to:
- review the control structure
- understand the framework layout
- inspect individual controls quickly
- see how controls are organized across maturity levels

### 2. In the CSV
Open the CSV directly in Excel, Google Sheets, or any CSV-compatible editor if you prefer working with the raw data model.

---

## How to propose changes

Community contributions are encouraged.

### Recommended workflow

1. Open the framework in the webapp.
2. Go to the **admin UI / Controls Editor**.
3. Make your edits **locally** in the editor.
4. When prompted, **download the updated CSV**.
5. Use that generated CSV as the basis for your contribution.
6. Open a **Pull Request** against this repository with your proposed changes.

This keeps the contribution flow clean and makes it easy to review proposed framework updates as CSV diffs.

### Important note
Please do **not** treat the live webapp as the source of truth for direct production editing. The source of truth for proposed changes should be the exported CSV submitted through a PR.

---

## Contribution expectations

When proposing framework changes, please try to keep updates aligned with the existing structure and style of the framework.

That includes maintaining consistency across columns such as:

- `Control ID`
- `Pillar`
- `IG`
- `Safeguard Title`
- `Customer Objective`
- `ELI5`
- `Detailed Requirement`
- `Lifecycle Trigger`
- `Cadence`
- `Primary Stakeholder`
- `Microsoft Tool Recommendation`
- `Generic Tooling Category`
- `Evidence of Completion`
- `Raw Weight`
- `Gate Type`
- `Minimum Status to Pass`
- `Minimum Evidence to Pass`
- `Fail Condition`
- `Why it Matters`
- `End Customer Business Value`
- `Customer Conversation Track`
- `Who Cares Most (Customer)`
- relevance flags
- `First Required When`

Good contributions usually do one or more of the following:

- improve wording clarity
- normalize control structure
- add missing safeguards
- improve evidence requirements
- refine stakeholder alignment
- tighten GTM language
- improve ELI5 explanations
- expand support for new AI deployment patterns

---

## Framework structure

The framework is organized into pillars and implementation groups:

### Implementation Groups
- **IG1**: baseline readiness
- **IG2**: scaling and managed practice
- **IG3**: advanced and higher-maturity controls

### Pillars
- **Strategy & Buy-In**
- **Policy & Governance**
- **Technical Readiness**
- **Copilot Readiness**
- **Process Mapping**
- **Data Security & Tagging**
- **AI Observability**
- **AI Tooling & Deployment**

### Copilot Readiness
The framework includes a dedicated **Copilot Readiness** pillar for Microsoft Copilot environments.

This is especially useful for MSPs and service providers using **Copilotive**, where Copilot-specific readiness needs to be assessed alongside the broader AI operating model.

Examples of areas covered in this pillar include:
- pilot licensing and app scoping
- self-service purchase controls
- web grounding decisions
- SharePoint grounding boundaries
- Teams meeting and transcript policy
- agent access and publishing controls
- managed device and browser containment
- Copilot telemetry and audit readiness

---

## Why this exists

Most organizations are adopting AI faster than they are governing it.

This framework exists to help the community move from vague AI enthusiasm to a practical, reviewable operating model that answers questions like:

- Who owns AI?
- What data can it access?
- What should be enabled first?
- How do we prove value?
- How do we govern Copilot safely?
- How do we scale without chaos?

The goal is not to create shelfware. The goal is to create a **usable, improvable control framework** that can be applied in real customer environments.

---

## Open source community project

This project is intentionally community-driven.

If you see something that should be improved:
- fix it
- export the updated CSV
- open a PR
- help make the framework better for everyone

The best version of this framework will come from real operators, MSPs, security leaders, enablement teams, and practitioners contributing what actually works.

---

## Suggested contribution format

When opening a PR, it helps to include:

- a short summary of what changed
- why the change improves the framework
- which pillar(s) or IG(s) were affected
- whether the change is net-new, normalization, or wording cleanup

Example:

> Added 3 new Copilot Readiness controls for agent publishing governance and normalized stakeholder wording across IG2.

---

## License / usage

Use this framework freely for review, improvement, and community contribution according to the license in this repository.

If you adapt it for internal or customer use, please preserve attribution where appropriate and contribute meaningful improvements back when possible.

---

## Getting started

- Review the framework at **framework.elkhmi.ai**
- Use the review-mode access path if registration is bypassed in your deployment
- Make edits in the **Admin — Controls Editor**
- Export a new CSV
- Open a PR against this repository

That is the preferred workflow for proposed changes.
