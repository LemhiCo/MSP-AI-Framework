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

### Implementation Groups

| IG | Meaning |
|----|---------|
| **IG1** | Baseline readiness |
| **IG2** | Scaling and managed practice |
| **IG3** | Advanced and higher-maturity controls |

### Pillars

| Pillar | Focus |
|--------|-------|
| **Strategy & Buy-In** | Executive ownership, use-case prioritization, roadmap |
| **Policy & Governance** | Policy lifecycle, approval workflows, accountability |
| **Technical Readiness** | Identity, access, environment, and platform hygiene |
| **Copilot Readiness** | Microsoft Copilot-specific controls and guardrails |
| **Process Mapping** | Workflow integration, incident response, change management |
| **Data Security & Tagging** | Classification, oversharing, data boundary enforcement |
| **AI Observability** | Monitoring, drift detection, audit, and reporting |
| **AI Tooling & Deployment** | Staged rollout, service management, rollback |

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
2. Go to the **Admin — Controls Editor**.
3. Make your edits locally in the editor.
4. When prompted, download the updated CSV or submit via the **Suggest Change** button.
5. A GitHub Issue will be opened automatically with your proposed changes.
6. Maintainers will review and open a Pull Request against this repository.

### Contribution expectations

Good contributions usually do one or more of the following:
- Improve wording clarity
- Normalize control structure
- Add missing safeguards
- Improve evidence requirements
- Refine stakeholder alignment
- Tighten customer-facing language
- Expand support for new AI deployment patterns

When opening a PR manually, include:
- A short summary of what changed
- Why the change improves the framework
- Which pillar(s) or IG(s) were affected
- Whether it is net-new, normalization, or wording cleanup

### Column reference

| Column | Description |
|--------|-------------|
| `Control ID` | Unique identifier (e.g. `STR-IG2-01`) |
| `Pillar` | Framework pillar |
| `IG` | Implementation group (IG1 / IG2 / IG3) |
| `Safeguard Title` | Short name for the control |
| `Customer Objective` | What this achieves for the customer |
| `Detailed Requirement` | Full specification |
| `Lifecycle Trigger` | When this control is activated |
| `Cadence` | How often it is reviewed or enforced |
| `Primary Stakeholder` | Who owns it |
| `Microsoft Tool Recommendation` | Microsoft-native tooling reference |
| `Generic Tooling Category` | Vendor-agnostic tool category |
| `Evidence of Completion` | What proof looks like |
| `Raw Weight` | Relative priority weight |
| `Gate Type` | Baseline / Scale Gate / etc. |
| `Minimum Status to Pass` | Minimum implementation state required |
| `Minimum Evidence to Pass` | Minimum evidence required |
| `Fail Condition` | What failure looks like |
| `Why it Matters` | Rationale |
| `Applies To` | Scope |
| `End Customer Business Value` | Customer outcome language |
| `Customer Conversation Track` | GTM / QBR framing |
| `Who Cares Most (Customer)` | Key customer stakeholder |
| `Relevant: GenAI` | Applicability flag |
| `Relevant: Custom GPTs` | Applicability flag |
| `Relevant: Agentic AI` | Applicability flag |
| `Relevant: Digital Workers` | Applicability flag |
| `Relevant: Cowork` | Applicability flag |
| `First Required When` | Entry point in the AI maturity journey |

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
