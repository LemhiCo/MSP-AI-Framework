# MAGIC Framework
**Managed AI Governance & Implementation Controls**
_Run with the GSO Loop: Govern. Secure. Operate._

---

## What this is

The **MAGIC Framework** is an MSP-native, controls-first framework for enabling AI across customer environments in a way that is **repeatable, governable, and monetizable**.

MAGIC is not a theory of AI. It is not a list of tools. It is a **control system** designed for Managed Service Providers who are responsible for operating AI across dozens or hundreds of tenants, each with different risk profiles, data realities, and business goals.

If CIS Controls are how MSPs made cybersecurity operational, **MAGIC is how MSPs make AI operational**.

This repository contains the source CSV that powers the framework. It is an **open source community project** — anyone can review the controls, suggest improvements, and contribute updates.

The framework is browsable at **[framework.lemhi.ai](https://framework.lemhi.ai)**.

---

## The Core Model: GSO

MAGIC is executed using a simple, durable operating loop:

### Govern
Establish clear ownership, intent, and boundaries before AI spreads. Governance answers:
- Who owns AI decisions in this tenant?
- What outcomes are we trying to produce?
- Which users, tools, and use cases are in scope right now?
- How do changes get approved, reviewed, or rolled back?

Governance happens **before** broad enablement and continues throughout the lifecycle.

### Secure
Reduce risk by making AI respect identity, data, and environment boundaries. Security in MAGIC assumes AI amplifies whatever already exists — good or bad. Controls focus on:
- Identity and access hygiene before AI access is granted
- Data scope, classification, and oversharing cleanup
- Technical guardrails that enforce policy, not just document it
- Auditability and evidence, not assumptions

Security is not "lock everything down." It is **intentional containment**.

### Operate
Run AI like a production service, not a pilot that never ends. MAGIC treats AI as something that must be deployed in stages, supported by service desks, observed and measured, and rolled back when it misbehaves.

If you cannot operate it, you should not enable it.

---

## Framework structure

### Implementation Guards

The framework uses five Implementation Guards (IGs) to sequence controls from baseline readiness through enterprise-grade and frontier operations. Each IG builds on the previous.

| IG | Level | What it covers |
|----|-------|----------------|
| **IG1** | Baseline | Foundational controls every AI deployment needs before go-live — sponsorship, pilot scoping, identity hygiene, basic observability |
| **IG2** | Managed | Scaled, repeatable practice — governance workflows, licensing guardrails, role-based enablement, structured rollout |
| **IG3** | Advanced | Higher-maturity controls for organizations running AI in production — policy depth, data classification, audit trails, advanced observability |
| **IG4** | Expert | Enterprise-grade controls — agent governance, regulatory compliance, environment separation, automated monitoring, decommission paths |
| **IG5** | Frontier | Highest-maturity controls for complex, high-risk, or heavily regulated environments — credential control, environment isolation, metered billing governance, frontier model oversight |

### Content Areas

| Content Area | Prefix | Focus |
|---|---|---|
| **Strategy & Buy-In** | STR | Executive ownership, use-case prioritization, roadmap |
| **Policy & Governance** | GOV | Policy lifecycle, approval workflows, accountability |
| **Technical Readiness** | TEC | Identity, access, environment, and platform hygiene |
| **Copilot Readiness** | CPL | Microsoft Copilot-specific controls, agents, and guardrails |
| **Process Mapping** | PRC | Workflow integration, incident response, change management |
| **Data Security & Tagging** | DAT | Classification, oversharing, data boundary enforcement |
| **AI Observability** | OBS | Monitoring, drift detection, audit, and reporting |
| **AI Tooling & Deployment** | DEP | Staged rollout, service management, rollback |
| **People & Skills** | SKL | AI literacy, role-based training, champions, capability gates |
| **Security** | REG | Regulatory mapping, compliance calendars, audit trails for regulated workflows |

---

## What qualifies as a MAGIC control

MAGIC is deliberate about what belongs in the framework. A control must meet **all** of the following:

1. **Operational, not conceptual** — it describes something that can be done, configured, reviewed, or evidenced. "Have an AI strategy" is not a control. "Named executive sponsor with approval authority" is.
2. **Has a clear owner** — a real role (customer executive, MSP vCIO, security lead, platform owner, service delivery manager). If no one owns it, it does not exist.
3. **Can produce evidence** — a policy doc, configuration export, dashboard, meeting cadence, decision log, or signed checklist. MAGIC assumes audits and QBRs are normal.
4. **Scales across tenants** — repeatable across customers with different sizes and industries. Controls that only work for one-off engagements or hero engineers do not belong.
5. **Aligns to GSO** — every control must clearly support Govern, Secure, or Operate. If it does not strengthen one of those motions, it is noise.

### What explicitly does NOT belong

- **Tool comparisons or vendor rankings** — MAGIC is tool-aware, not tool-biased. Tools change faster than controls.
- **Custom application development guidance** — MAGIC is not a software engineering framework.
- **Ethics without enforcement** — ethics only appear when enforceable through policy, access restrictions, or audit.
- **One-time assessments** — every control assumes ongoing cadence, review, and potential rollback.
- **End-user productivity tips** — not a prompt library or training course. Those belong in enablement programs.

---

## How to contribute

Community contributions are encouraged and the preferred path is through the webapp.

### Recommended workflow

1. Open the framework at **[framework.lemhi.ai](https://framework.lemhi.ai)**.
2. Navigate to the **Contributors** tab.
3. Make your edits in the controls editor.
4. Click **Suggest Change** — a GitHub Issue is created automatically with your proposed changes encoded as a patch.
5. Maintainers review and open a Pull Request against this repository.
6. Once merged, the updated controls go live for everyone and your handle is added to the contributors list.

### Contribution expectations

Good contributions usually do one or more of the following:
- Improve wording clarity
- Normalize control structure
- Add missing safeguards
- Improve evidence requirements
- Refine stakeholder alignment
- Tighten customer-facing language
- Expand support for new AI deployment patterns (agents, digital workers, regulated environments)

When opening a PR manually, include:
- A short summary of what changed
- Why the change improves the framework
- Which content area(s) or IG(s) were affected
- Whether it is net-new, normalization, or wording cleanup

### Column reference

Each control row contains the following fields:

| Column | Description |
|--------|-------------|
| `UID` | Stable numeric identifier — does not change when Control ID is renamed |
| `Implementation Guard` | Maturity level (IG1–IG5) |
| `Control ID` | Human-readable identifier (e.g. `STR-IG2-01`) — may change as controls are reorganized |
| `Content Area` | Framework pillar |
| `Safeguard Title` | Short name for the control |
| `Customer Objective` | What this achieves for the customer |
| `Detailed Requirement` | Full specification |
| `Lifecycle Trigger` | When this control is activated |
| `Cadence` | How often it is reviewed or enforced |
| `Primary Stakeholder` | Who owns it |
| `Evidence of Completion` | What proof looks like |
| `Minimum Status to Pass` | Minimum implementation state required |
| `Minimum Evidence to Pass` | Minimum evidence required |
| `Fail Condition` | What failure looks like |
| `Why it Matters` | Rationale |
| `Who Cares Most (Customer)` | Key customer stakeholder |

---

## Why MSPs need this

AI changes the MSP risk equation. An MSP does not enable AI once — it enables AI across many customers, tools, regulatory environments, and business models. That creates **compound risk** and **compound opportunity**.

MAGIC exists to:
- Turn AI from a consulting motion into a managed service
- Prevent shadow AI from becoming the default operating model
- Give MSPs a defensible, repeatable way to say "yes" to AI without losing control
- Create a shared language between MSPs, customers, security teams, and executives

---

## Open source

This project is intentionally community-driven. If you see something that should be improved — fix it, submit a change, and help make the framework better for everyone.

The best version of this framework will come from real operators, MSPs, security leaders, enablement teams, and practitioners contributing what actually works.

---

**The MAGIC Framework gives MSPs a practical, control-based way to Govern, Secure, and Operate AI at scale across customer environments without relying on hype, heroics, or hope.**
