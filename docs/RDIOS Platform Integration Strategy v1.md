Status: 🔵 Strategy review — no code, no implementation, no changes to any frozen document. Extends the frozen Product Foundation's layering to the ecosystem scale: multiple products, not just multiple institutions inside one product. Nothing here is architecture yet; it's the reasoning that future architecture reviews (when Tamizhi, the Developer Platform, or Marketplace actually approach) should be checked against.

# RDIOS Platform Integration Strategy v1

## Context

RDIOS stopped being "Retro Daddy's internal software" several documents ago. This one takes that seriously all the way to the edge of the picture: a future where Retro Daddy Empire is one customer among many, where Tamizhi serves products RDIOS has never heard of, and where RDIOS itself might have siblings — a fashion-commerce product, a websites product — that share an intelligence layer but nothing else. Nothing below changes what gets built for M3. It exists so M3 through M12 grow toward this picture without anyone needing to redesign the foundation to get there.

## The platform relationships, as they actually are — not the example given

```
                              Tamizhi
                    (the shared intelligence layer —
                     a sibling to every product, not
                     owned by any one of them)
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
            RDIOS              Fashion            Websites
     (institutional          (a product          (public presence,
      operating system)       ecosystem)          per institution)
              │                  │                  │
              ▼                  ▼                  ▼
        Institutions          Products          Marketing sites
      (tenants — Retro                        (an institution's own
       Daddy becomes                            public face is served
       exactly one)                             HERE, not inside RDIOS)
              │
              ▼
   Work · Money · People · Projects · Customers · Documents · Reports
     (each institution's internal operations — RDIOS's actual job)
```

The load-bearing correction to the founder's own example: **RDIOS does not sit beside Fashion and Websites as a peer product doing the same kind of thing.** RDIOS runs an institution's *internal* operations — who works there, what's being decided, where the money's going. Fashion and Websites (and whatever else exists later) run an institution's *external* concerns — what it sells, what the world sees. A single real institution could use RDIOS for its internal operating system *and* Websites for its public site *and* Fashion if it happens to sell clothes — three separate products, one real institution, sharing nothing except identity (optionally, see §3) and Tamizhi. This is the same subsystem/attention split the Product Philosophy already established, just drawn one layer higher: **RDIOS owns institutional attention. It was never meant to own everything an institution does.**

---

## 1. How RDIOS stays independent from RDE forever

This isn't a new rule — the Product Foundation already set it (no shared repository, no runtime dependency, RDE as reference only) — but "forever" deserves its own teeth, because the pressure to erode it will be highest exactly when it matters most: the day Retro Daddy itself becomes a real RDIOS customer.

**The test that has to keep passing, indefinitely:** RDE must be sellable, shut down, or forked without RDIOS noticing. RDIOS must be spun out, sold, or run by a completely different team without RDE noticing. No shared codebase, no shared deploy, no shared database, no shared session system — not as a starting position that erodes under convenience, but as a standing rule with exactly one enforcement mechanism worth naming: **when Retro Daddy becomes an RDIOS customer, it goes through the identical onboarding path any stranger would use.** The moment Retro Daddy gets a special path into RDIOS that a Temple or a Hospital doesn't also get, independence has already quietly ended, whatever the architecture diagram still claims.

## 2. Retro Daddy as a customer — a real Institution, not a tighter integration

A plain Institution, onboarded through the exact same flow already live-verified this engagement — no exception, no shortcut, no privileged data pipe.

The instinct toward "tighter integration" is really two different desires wearing one costume, and separating them resolves the tension: **preserving RDE's historical data** is a real, legitimate want; **architectural coupling between the two systems** is not, and doesn't need to be the price of the first one. The right shape is a **one-time migration, not a standing integration** — once RDIOS's Money, Customers, and Projects applications are mature enough to receive it, RDE's historical expenses, leads, and project records get imported into Retro Daddy's Institution as a deliberate, bounded, tooling-assisted event, the same category of operation as any customer migrating off a legacy system into RDIOS. Nothing about RDIOS's ongoing operation depends on that import ever happening, and nothing about RDE's ongoing operation depends on RDIOS existing. Retro Daddy simply becomes RDIOS's best-documented customer, having been its first reference institution long before it was a customer at all.

## 3. Authentication, long-term

**People log into RDIOS directly, always, as the only required path.** RDIOS's own Identity layer — already being built — is sovereign. Nothing about signing into RDIOS should ever route through RDE, and RDE should never "launch" RDIOS in the sense of being a gate someone has to pass through first; that would make RDE an unremovable dependency of RDIOS's front door, exactly the coupling §1 forbids.

**SSO is a real, legitimate future want, and it doesn't contradict the above if it's built the right shape.** The distinction that matters: SSO should mean *portable identity*, never *shared backend*. A person could reasonably want to use one real-world identity (a "Retro Daddy Account," or whatever the ecosystem eventually calls it) to sign into RDIOS, Fashion, and Websites without three separate passwords — but each product keeps its own independent session, its own independent data, its own independent uptime. The identity provider becomes a thin, optional, federated layer every product can *accept* logins from, the way large platforms let one account sign into many otherwise-unrelated products. It never becomes a dependency any product requires to function, and no product's core data ever lives there. RDIOS's own dev-mode auth today — direct, self-contained, no external gate — is already the correct shape of the *permanent* answer, not just a placeholder for it; what changes later is only that a second, optional entry path gets added beside it, never in place of it.

## 4. Where Tamizhi belongs

**Tamizhi is not inside RDIOS, and RDIOS does not own it.** It's a sibling, like Fashion and Websites — a shared intelligence layer every product calls into, including products that don't exist yet. Placing it inside RDIOS would make every other future product either duplicate it or depend on RDIOS to reach it, and both outcomes are wrong for a capability meant to outlive any one of its consumers.

**How RDIOS consumes it without RDIOS depending on it to function** is already, unknowingly, solved — the Visual Design System named this exact seam before Tamizhi was ever discussed in ecosystem terms: Tamizhi enters RDIOS through the same two doors already reserved for it. As a **Search provider** — the existing provider-registry pattern doesn't care whether a provider is a database query or a model call, so "answer questions" and "search institutional knowledge" are simply a more capable provider registering the same way every other one does. And as an **Attention Contract contributor** — "recommend a decision" is just another Act Now card, same shape, same verb, same tier, indistinguishable in the UI from a card any application already produces. RDIOS's own code never needs a concept called "the AI"; it needs a provider and a contributor, both interfaces it already has reasons to define for ordinary, non-AI purposes.

**The concrete test that keeps AI from becoming the center of RDIOS, given platform shape:** every application, every Act Now card, every search result must continue to work correctly with Tamizhi entirely offline. RDIOS calls Tamizhi; RDIOS is never called by it, and never blocks on it. This is the platform-level enforcement of what the Product Philosophy already declared a principle — now it has a mechanism, not just a sentence.

**The wider capability list the founder named** — image and video creation and editing, code generation and review, document generation, workflow automation, financial and project analysis — belongs entirely to Tamizhi itself, not to RDIOS. RDIOS's job is narrower and more disciplined than any of that: know when a decision or a search result is available, ask Tamizhi for it, and present whatever comes back inside RDIOS's own calm, tiered, card-shaped language — never Tamizhi's own interface bleeding through. A generated report is still a Report, shown the RDIOS way; a recommended decision is still an Act Now card, verb and all.

## 5. Where future products belong — inside RDIOS, beside it, or never

| Product / surface | Belongs | Why |
|---|---|---|
| **Public API** | Inside RDIOS | Not a new product — the existing Application Layer, exposed over HTTP instead of a page. One backend; the API is a client of the same interfaces every RDIOS screen already calls. It must never become a second, divergent way to read or write institutional data. |
| **Mobile / Desktop clients** | Beside RDIOS | Separate front ends, zero separate business logic — every client, present or future, consumes the identical Public API. The moment a mobile app needs its own copy of a business rule, that rule has leaked out of the Application Layer where it belongs. |
| **Customer / Vendor / Citizen / Client Portal** | Inside RDIOS | These are one concept wearing institution-specific vocabulary — a limited-scope external Person + Membership, exactly the mechanism the People Domain Review already designed for exactly this case (a patient with portal access, a donor with a recognition view). A government department's "Citizen Portal" and an agency's "Client Portal" are the identical mechanism under different Institution Configuration Layer terminology, not four separate features. |
| **Automation** | Inside RDIOS | Not a new engine — a rule that reacts to Events and creates or assigns Work Items, built entirely from machinery already frozen (Events, Work Engine, Assignment). It may earn its own application-layer surface later, but nothing about it requires new infrastructure. |
| **Institution-level Analytics (Reports)** | Inside RDIOS | Already M11 — an institution understanding its own operations is exactly RDIOS's job. |
| **Platform-level Analytics** (usage, growth, churn across every institution) | Beside RDIOS | A platform-operator tool, never exposed to a tenant institution — surfacing one institution's activity to platform operators sits directly against tenant isolation, the same boundary the Tenant Architecture was written to protect. |
| **Marketplace** | Beside RDIOS | A storefront for the ecosystem, not an operating system screen — it may eventually be *built on* RDIOS's own Money/Customers primitives once those exist, but it's its own product with its own audience (extension developers and institutions browsing extensions), not a destination inside any one institution's Home. |
| **Developer Platform** | Beside RDIOS | Documentation, API keys, sandbox institutions for testing an extension — exists to serve people building *for* RDIOS, not people using one. |
| **An institution's own Public Website** | Never inside RDIOS | Belongs to the sibling Websites product, per institution, the same relationship RDE's own public site already has to everything built this engagement — external presence was never RDIOS's job, for any institution, including Retro Daddy's own. |

## 6. What protects RDIOS from becoming another monolithic ERP

Every rule below is the Product Philosophy's core thesis — the subsystem owns truth, RDIOS owns attention — defended against the specific ways it erodes over years, not just stated once at the start:

- **The headless test stays permanent, not a one-time check.** Any application that quietly grows a dependency on Home to function correctly has started the exact drift that turns a clean platform into a monolith no one can safely change.
- **No application reads another application's tables directly, ever** — only through the Attention Contract and, once it exists, a real internal interface boundary. This is the single rule that most determines whether RDIOS is still legible in ten years or has become a warehouse nobody wants to open.
- **Every new capability answers the Product Philosophy's test before it answers "would this be useful."** Serves institutional memory, or serves institutional attention — or it doesn't belong, no matter how easy it would be to add.
- **The Extension Architecture is the only door new capability enters through.** No "just this once" special case hardcoded into the core — every exception made this way is a small, permanent tax on every future engineer's ability to reason about the platform.
- **The Operating System Layer stays thin, forever.** Home, Search, the Attention Engine coordinate; they never accumulate business logic of their own. The moment Home "knows" something about Money specifically, the layering has already failed, quietly, in a way that's expensive to unwind later.
- **Configuration is always data. A `type === "hospital"` branch anywhere in application code is a bug report, not a shipped feature** — it means something that should have been Institution Configuration got written as code instead, and it will need to be found and fixed before the next institution type exposes it again.

## 7. Reusable platform capability vs. institution-specific configuration

**Always reusable, never institution-specific:** the entire Shared Engine Layer (Work, Authorization's mechanism, Notifications, Documents, Workflow, Events, Assignment, Audit); the Operating System Layer (Attention Engine, Search, Identity); the Application Layer's *structure* — what People, Work, Money, and each application *is* and which Attention Contract it implements; Tamizhi's core intelligence capability, consumed the same way by every product that calls it.

**Always institution-specific configuration, never code:** terminology, Organization Templates, the permission catalog's actual entries, branding, workflow template content, which applications an institution has active, business rules like approval thresholds and fiscal year.

**The test for anything new, going forward, worded so it survives contact with a feature that doesn't obviously fit either list:** *if two different institution types would reasonably want this to behave identically, it's platform capability. If they'd legitimately want it to look or behave differently, it's configuration.* A feature request that seems to need both is almost always a platform capability with a configuration surface hiding inside it, not a reason to write conditional code — the Organization Templates already frozen are exactly this pattern: one engine, many starter shapes, never a branch.

---

Nothing implemented. No frozen document changed. M3 begins from exactly where the Master Roadmap already left it.
