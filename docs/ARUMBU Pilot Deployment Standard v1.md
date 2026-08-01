Status: 🔵 Deployment playbook — design only, no code, no roadmap change, no constitutional amendment, no onboarding redesign. Marks the close of the Architecture & Design Phase: the ARUMBU Constitution v1, the Design System & Interaction Standards v1, and the Extension Development Standard v1 are all treated as permanently frozen, and the four Reality Validation documents (Garment Manufacturing, Hospital, School, Government Department) are treated as complete and successful. The question this document answers is no longer whether ARUMBU can model an institution — it is how a real institution safely adopts it.

# ARUMBU Pilot Deployment Standard v1

## Section 1 — Purpose

**Pilot** — a bounded, reversible, real-data trial of ARUMBU inside one deliberately scoped slice of a real institution, run specifically to learn what deployment risk actually looks like before committing wider. A pilot touches real, live, consequential operations; a sandboxed demonstration teaches nothing this document can use.

**Rollout** — the deliberate, staged expansion of an already-successful pilot to the rest of the institution, one dimension (department or application, never both together) at a time.

**Deployment** — the entire arc from first contact with an institution through steady-state operation: readiness, discovery, migration, training, pilot, rollout, go-live, and support, considered as one continuous whole, never as a project that ends at go-live.

**Migration** — the one-time, bounded act of moving an institution's existing real data into ARUMBU's own Records, using the provider seam Enterprise Foundation already designed. Never a standing integration — Platform Integration Strategy §2 already names the correct shape for exactly this, calling RDE's own historical import "a one-time migration, not a standing integration," and this document applies the identical discipline to every institution's own legacy data.

**Adoption** — the ongoing, human measure of whether real people actually use ARUMBU as their genuine daily working surface, distinct from deployment (which has an end) and continuing indefinitely for as long as the institution operates.

**Support** — the standing operational relationship between an institution and whoever maintains its ARUMBU instance after go-live: training refreshers, incident response, configuration assistance, never a service that simply stops.

---

## Section 2 — Readiness Assessment

**Two non-negotiable gates. Deployment does not begin without both:**

- **Leadership commitment** — a real, named seated Position (the founder-equivalent) who has personally used ARUMBU, not merely approved a purchase order.
- **An operational champion** — a real, named person, not necessarily the most senior, who will be the daily advocate and first point of contact, and whose own Home is what the pilot's Attention composition gets tuned against.

**Strongly recommended, addressable during the pilot itself if not fully ready before it:**

- **A named pilot team** — real people, not "IT" as an abstraction.
- **Existing workflows documented** in plain language — not a re-engineering exercise, an honest account of how the pilot's chosen slice of work currently happens, which becomes the discovery input (§3) and the yardstick migration validation is checked against (§4).
- **An honest data-quality inventory** — what exists, in what shape, how trustworthy it is. Migrating garbage produces garbage no amount of correct architecture can fix downstream.
- **Real, blocked calendar time for training** — not squeezed around an already-full workload.
- **A risk register**, seeded from §8's own catalog, reviewed weekly through the pilot.
- **Success metrics agreed before go-live** — never invented afterward to justify whatever happened.

---

## Section 3 — Institution Discovery

Not onboarding — Institution Setup Experience v2 already owns the in-product, Day-1-attention experience, and this section does not redesign it. Discovery is what the deployment team does *before* any data touches the platform:

- **Departments and hierarchy** — mapped as the Organization Builder's own starting shape, never assumed final; the institution refines its own chart inside the product afterward.
- **Terminology** — the actual words staff already use, captured directly and becoming the Institution Configuration Layer's own profile from day one, never discovered painfully later.
- **Policies** — existing real rules, written or tribal, captured first as plain prose, respecting the Institutional Policy Model's own ordering: Policy is authored in institutional language before any Business Rule is ever compiled from it.
- **Approval chains** — how decisions actually move today, translated into Areas of Responsibility, never into named individuals.
- **Operational vocabulary** — what the institution calls its own coordinating Flow (a Production Order, a Patient Case, a Citizen File), feeding Project's own terminology directly, per the Operational Flow investigation's own central recommendation.
- **Existing software** — named and assessed as migration input (§4).
- **Reporting needs** — what leadership currently asks for, gets, and can't get, informing which of the nine Report categories matter first for this specific institution.
- **Pain points** — named explicitly and honestly, held for direct comparison at the end of the pilot (§9).

---

## Section 4 — Migration Strategy

- **Migration order** — smallest, most self-contained, least interdependent data first, sequenced by dependency, not by importance. People and Positions before Finance, since Finance's own shared spine depends on real Position/Area data already existing.
- **Validation** — every migrated Record is checked against the Universal Record Model's own three-property test as a real pass/fail gate, the identical discipline the Extension Development Standard already certifies new applications against, applied here to migrated data instead of new code.
- **Parallel running** — for a defined, bounded window, the legacy system and ARUMBU run side by side against the same real transactions. Any discrepancy is investigated immediately, never assumed to be either system's fault without checking. **For real financial data specifically, one single system is named the source of truth in advance, in writing** — ambiguity about which system is authoritative is never allowed to persist past one business day.
- **Rollback** — every migration step has a tested undo path before it ever runs against real data, mirroring Enterprise Foundation's own "revertible deploys, no forced destructive migration" discipline, applied to institutional onboarding instead of code deploys. A hard rollback deadline is set in advance; past it, correction moves forward, not backward, communicated honestly.
- **Verification** — the identical six-step discipline this entire corpus already holds every milestone to: real validation, and a live walkthrough performed by real staff, never the deployment team standing in for them.

---

## Section 5 — Training

| Persona | Sequence & Duration | Focus | Certification |
|---|---|---|---|
| **Founder / CEO** | A single, short session, early | Reading Home in thirty seconds — calm vs. not-calm, nothing else | Can correctly interpret Home unaided |
| **Managers** | Half a day | Their own Approval and Governance responsibilities, their team's own Attention composition | Can complete a real Approval decision independently |
| **Staff / Operators** | The shortest, most hands-on session | Their own single daily task only — create a Task, log an Expense, add a Comment | Can complete their own core flow, live, unassisted |
| **HR** | Half a day | People, Governance, offboarding | Can appoint, transfer, and offboard correctly |
| **Finance** | Half a day | Money, Reports, Resource Transactions | Can reconcile a real transaction against the shared spine |
| **IT / Operational champion** | The deepest session, multi-day | Enough depth to answer Tier-1 questions independently, without escalating every question | Can resolve a simulated common issue without deployment-team help |

**Certification means demonstrated, independent completion of a real flow — never merely having sat through a session**, reusing the exact objectively-testable discipline the Extension Development Standard already established for applications, applied here to people. **Support after training tapers from daily office hours through a defined window into standing support (§7) — never a cliff.**

---

## Section 6 — Pilot Strategy

**Entry point** — one real, bounded, self-contained workflow inside one department, touching genuinely live, consequential operations. Choose the workflow with the shortest feedback loop and the least catastrophic blast radius if something goes wrong — Work/Task tracking or Documents make a safer first pilot than Finance's own Approval Chain, where real money is immediately at stake.

**Exit criteria** — the pilot's own success metrics (§9) are met for a defined *minimum sustained period*, never a single good day, and every risk from §8 relevant to the pilot's own scope has been observed to either not occur or be handled correctly when it did.

**Success criteria** — real, voluntary usage: the pilot team using ARUMBU as their genuine working surface without being reminded, not merely its availability.

**Rollback criteria** — named explicitly, in writing, before go-live: if adoption genuinely fails, or a real operational disruption occurs that the legacy process would have prevented, the institution returns to its prior process without penalty, and the reasons are documented honestly, feeding directly into §10.

**Expansion** — one dimension at a time. Add a department, or add an application — never both together, so that any new problem's source is always attributable to exactly one change.

---

## Section 7 — Go-Live

- **Day 1** — the deployment team present and reachable in real time; Attention watched closely; no other major operational change scheduled that same day.
- **Week 1** — daily fifteen-minute check-ins with the pilot team; the risk register reviewed daily.
- **Month 1** — weekly check-ins; first real usage metrics (§9) reviewed; an honest conversation about whether §3's own named pain points have actually improved.
- **Month 3** — the pilot's own exit criteria (§6) formally evaluated; the rollout decision made or deferred.
- **Month 6** — a full deployment retrospective, feeding §10's own decision process; support formally transitions from project-shaped to standing, ongoing, and never abruptly withdrawn.

---

## Section 8 — Fifty Deployment Risks

**Adoption & Human**
1. Staff resistance to changing familiar habits. *Prevent: involve the pilot team in discovery, never surprise them. Detect: usage lags despite availability. Respond: revisit training focus, never force it.*
2. Leadership disengagement after launch. *Prevent: Home habit built during training. Detect: the founder stops opening Home. Respond: re-engage through the champion.*
3. Champion burnout. *Prevent: realistic time allocation from day one. Detect: slowing response time. Respond: appoint a second, backup champion.*
4. Training fatigue. *Prevent: persona-scoped training only. Detect: low post-training confidence. Respond: shorter, more frequent refreshers.*
5. Fear of being watched. *Prevent: explain Attention's calm, earned-not-assumed philosophy directly. Detect: staff avoiding logging real activity. Respond: reaffirm no surveillance, citing the Institutional Presence investigation's own guardrail.*
6. A vocal skeptic undermining adoption. *Prevent: involve skeptics early, in discovery. Detect: negative sentiment in check-ins. Respond: address the concern directly.*
7. Unfavorable comparison to a familiar old tool. *Prevent: set the expectation that week one is genuinely harder. Detect: direct comparisons in feedback. Respond: determine whether the lost convenience is real or simply not yet configured.*
8. Uneven technical comfort among staff. *Prevent: pace hands-on training to the real audience. Detect: uneven core-flow completion. Respond: pair less confident staff with the champion directly.*
9. Over-reliance on the deployment team. *Prevent: train the champion to real independence before tapering support. Detect: every question still escalates externally. Respond: extend deep training before withdrawing.*
10. Departmental politics over an unchosen pilot. *Prevent: choose pilot scope with real cross-department input. Detect: passive non-participation. Respond: reconfirm rollback criteria exist, lowering the perceived stakes of "losing."*

**Data & Migration**
11. Migrating stale or incorrect data. *Prevent: a real data-quality assessment before migration. Detect: parallel-running discrepancies. Respond: pause, correct at the source.*
12. Duplicate records created in migration. *Prevent: a dedupe pass beforehand. Detect: Search surfacing near-identical results. Respond: merge via the accepted "same-as" relationship, never delete history.*
13. Incomplete migration. *Prevent: a migrated-count check against the legacy system. Detect: a count gap. Respond: investigate before declaring migration complete.*
14. Data that fails the Universal Record Model's own test. *Prevent: a validation gate. Detect: a Record with no real identity or "now." Respond: reject, resolve at the source.*
15. Lost informal historical context. *Prevent: capture it as real Comments during migration. Detect: staff asking where a note went. Respond: recover from source if possible, document the gap honestly if not.*
16. Migration overrunning the parallel-running window. *Prevent: a realistic, padded timeline. Detect: the window closing incomplete. Respond: extend, never cut short.*
17. Inherited bugs from the legacy system. *Prevent: spot-check against real-world ground truth, not just the old system's own record. Detect: a migrated fact that's simply wrong. Respond: correct at the source, re-migrate.*
18. Rollback attempted too late. *Prevent: a hard rollback deadline set in advance. Detect: the deadline passing. Respond: correction moves forward honestly, not backward.*
19. Terminology confusion during transition. *Prevent: terminology captured explicitly during discovery. Detect: two words for one thing. Respond: confirm and lock the institution's own chosen word.*
20. Unreconciled migrated financial data. *Prevent: a reconciliation check before go-live. Detect: totals that don't balance. Respond: never accept an unreconciled Finance migration.*

**Configuration & Governance**
21. Areas named as bare verbs. *Prevent: review discovery output against Governance §1's own naming rule. Detect: a verb-shaped permission key. Respond: rename before go-live.*
22. Approval Chains naming people, not Areas. *Prevent: discovery translates "who does this" into "who is responsible," never a name. Detect: a chain that breaks the moment someone's role changes. Respond: reconfigure against the Area.*
23. A same-actor-exclusion posture wrong for institution size. *Prevent: apply Governance §6's own sizing guidance deliberately. Detect: unworkable friction, or an unflagged conflict-of-interest risk. Respond: adjust per Governance's own configurable posture.*
24. Terminology frozen after one capture, never revisited. *Prevent: schedule terminology review as standing practice. Detect: staff reverting to old words informally. Respond: treat as real feedback, update configuration.*
25. Missing Policy content leaving real decisions ungoverned. *Prevent: treat Policy capture as seriously as data migration. Detect: an Approval with no real criteria behind it. Respond: author the missing Policy before it causes a bad decision.*
26. Over-broad initial permissions "to avoid blocking anyone." *Prevent: grant real, minimum necessary Areas from day one. Detect: someone approving something they shouldn't. Respond: correct the grant immediately, audit what happened while it was open.*
27. An org structure copied too literally from a stale chart. *Prevent: validate against how work actually happens, not the last published chart. Detect: Escalation routing to someone with no real standing. Respond: correct the graph, not the routing logic.*
28. A bespoke workaround instead of real Configuration. *Prevent: train the deployment team on the Extension Development Standard's own discipline. Detect: hardcoded content found in review. Respond: replace with real configuration.*
29. Emergency Governance left unconfigured until an emergency happens. *Prevent: name and rehearse emergency modes during the pilot. Detect: a real emergency with no pre-declared mode. Respond: treat as an urgent post-incident configuration gap.*
30. Delegation used as a permanent workaround. *Prevent: train on Governance §3's own non-negotiable expiry rule. Detect: an indefinitely-renewed Delegation. Respond: convert to a real Position holding.*

**Operational Disruption**
31. An Approval blocked by an unheld Area. *Prevent: confirm every real Area has a real current holder before go-live. Detect: a stuck decision in week one. Respond: appoint immediately, treat as a go-live blocker.*
32. Notification overload from both old and new systems running at once. *Prevent: a clean, single-day cutover for notifications. Detect: complaints of double alerts. Respond: fully disable the legacy system's own notifications at go-live.*
33. Search underused from unfamiliarity. *Prevent: include Search explicitly in every persona's training. Detect: staff still asking colleagues instead of searching. Respond: a short, targeted refresher.*
34. A real task genuinely faster in the old system during transition. *Prevent: acknowledge this honestly rather than deny it. Detect: quiet reversion to the old tool for that task. Respond: determine whether it's a training gap or a real configuration gap, fix accordingly.*
35. Incorrect data entry by a rushed, uncertified staff member. *Prevent: require certification before independent use. Detect: an obviously wrong Record. Respond: correct via a new entry, never an edit, and revisit that person's training.*
36. Pressure to expand faster than exit criteria allow. *Prevent: require a sustained period, not one good week. Detect: rollout proposed early. Respond: hold the line on defined criteria.*
37. A real crisis coinciding with go-live. *Prevent: schedule go-live deliberately away from known busy or high-stakes periods. Detect: an emergency in week one. Respond: pause non-essential rollout activity, support the crisis first.*
38. Confusing a real defect with a training gap. *Prevent: the deployment team triages every report first. Detect: a recurring complaint with no clear cause. Respond: reproduce it directly before assuming either cause.*
39. Financial ambiguity during parallel running. *Prevent: name one single source of truth in writing, in advance. Detect: a reconciliation mismatch. Respond: resolve within one business day, never longer.*
40. The champion unreachable during a real incident. *Prevent: a named backup contact from day one. Detect: an unresolved issue with no response. Respond: escalate directly to the deployment team.*

**Support & Continuity**
41. Support withdrawn abruptly at the pilot's formal end. *Prevent: a tapering, not a cliff, support schedule agreed in advance. Detect: a spike in unresolved issues right after. Respond: extend the taper.*
42. No clear path for raising an ongoing improvement idea. *Prevent: communicate §10's own process to every trained user, not just the champion. Detect: good ideas surfacing informally and going nowhere. Respond: institute a standing feedback channel.*
43. Confusion between Configuration and Implementation backlog. *Prevent: classify every issue explicitly at the moment it's raised. Detect: the institution assuming a Configuration fix requires "waiting for ARUMBU." Respond: correct the classification, resolve locally where possible.*
44. Lost institutional knowledge when the champion moves on. *Prevent: a real, documented handover process. Detect: a successor with no context. Respond: apply People's own Atomic Offboarding discipline, exactly as for any other role.*
45. Stale training materials as configuration evolves. *Prevent: version training materials alongside configuration changes. Detect: a new hire trained on an outdated screen. Respond: refresh on a defined cadence, not only when noticed.*
46. Success metrics never revisited after the initial pilot. *Prevent: review §9's own metrics on a standing cadence. Detect: nobody can currently answer "is this still working well." Respond: reinstate the review cadence.*
47. Support becoming purely reactive. *Prevent: maintain a proactive check-in cadence even after formal support tapers. Detect: months of silence broken only by a complaint. Respond: reinstate a light, regular touchpoint.*
48. Confusing a genuinely new need with a request to reopen the Constitution. *Prevent: run every request through §10's own decision process first. Detect: a proposal to "just add a new mechanism." Respond: apply the same disproof-first method the Reality Validation series already modeled repeatedly.*
49. Findings from separate institutions never compared. *Prevent: maintain a real, standing, shared findings log across every deployment, not just the current one. Detect: the same real gap independently rediscovered elsewhere. Respond: build the aggregation habit before scale makes its absence expensive.*
50. Treating go-live as "done." *Prevent: frame deployment, from day one, as the beginning of Adoption, never its conclusion. Detect: all monitoring stopping at go-live. Respond: reinstate the full Month 1/3/6 cadence.*

---

## Section 9 — Success Measurement

Every metric below is derived from architecture this Constitution already contains — nothing new is invented:

- **Operational metrics** — Approval and Task cycle time, reused directly from the Operational Intelligence Framework's own delay signal.
- **Adoption metrics** — the share of trained staff completing a real action independently within week one; daily active use of Home.
- **Quality metrics** — the Universal Record Model validation pass rate on records created *after* go-live, not migrated; the reopened-task/rework rate, reusing the Operational Intelligence Framework's own wastage signal.
- **Governance metrics** — the share of Approval Chains with a real current holder at all times; how often a same-actor-exclusion recommendation was heeded versus ignored.
- **Attention quality** — the ratio of Act Now items genuinely acted on versus left to expire unresolved, the most honest available signal of whether Attention has earned real trust; whether Be Aware items are reported as genuinely useful in the regular check-ins §7 already schedules.
- **Search usage** — query volume trend (rising signals growing trust); the zero-result rate trend, reusing the Operational Intelligence Framework's own already-designed signal, now read as a deployment health indicator instead of an institutional one.
- **Tamizhi usefulness** — the Accept rate on Recommendations, read carefully: a low rate may mean poorly-tuned rules, or may mean a genuine mismatch worth investigating on its own terms, never assumed automatically to mean Tamizhi has failed.
- **Operational Intelligence usefulness** — how many of §3's own named real pain points were caught by a Signal before a human noticed, the single most direct test of whether Operational Intelligence delivered on its own founding question: what can ARUMBU detect before humans notice.

---

## Section 10 — Continuous Improvement: the decision process

Every finding raised during or after deployment is run through the identical sequence the Reality Validation series has already proven out across four full institutional years, in this exact order, stopping at the first classification that honestly applies:

1. **Resolved by existing architecture** — the overwhelming majority of findings, historically.
2. **Implementation backlog** — a real gap, closed by extending an already-existing type or building an already-anticipated Signal Provider, never a new mechanism.
3. **Configuration only** — a Business Rule, threshold, or default that simply needs setting correctly.
4. **Terminology only** — a word that needs capturing or correcting in the Institution Configuration Layer.
5. **Operational Convention** — a real, nameable practice the institution should adopt, using mechanisms this Constitution already contains, simply never combined this way before.
6. **Policy** — content the institution itself needs to author, never platform code.
7. **Extension-specific** — a genuinely institution- or industry-specific need, built on the Extension Development Standard, never inside ARUMBU core.
8. **Potential constitutional amendment** — the last resort, reached only after every prior classification has been tested and genuinely fails, exactly as the Reality Validation series' own disproof-first method already demonstrated across four institutions and dozens of adversarial tests.

**No finding is ever classified at step 8 without first being tested, in writing, against every step above it.**

---

## Section 11 — Pilot Completion Checklist

☐ **Readiness** — Leadership commitment confirmed. Operational champion named. Pilot team named. Existing workflows documented. Data quality assessed. Training time blocked. Risk register opened. Success metrics agreed in writing.

☐ **Discovery** — Departments and hierarchy mapped. Terminology captured. Existing policies captured in plain language. Real approval flows translated into Areas, not names. Operational vocabulary for the coordinating Flow named. Existing software inventoried. Reporting needs named. Pain points named explicitly.

☐ **Migration** — Migration order sequenced by dependency. Every migrated Record validated against the Universal Record Model's three-property test. Parallel-running window defined, with one named source of truth for financial data. Rollback path tested before real data migrates. Migrated financial data reconciled.

☐ **Training** — Every persona trained per Section 5. Every trained person certified by independent completion of their own core flow, not attendance.

☐ **Pilot** — Entry point chosen: one department, one real workflow. Exit, success, and rollback criteria all written down before go-live.

☐ **Go-Live** — Day 1 support present. Week 1 daily check-ins scheduled. Month 1, 3, and 6 reviews scheduled in advance.

☐ **Support** — A tapering, not a cliff, schedule agreed. A named backup contact exists alongside the champion.

☐ **Measurement** — Every metric in Section 9 has a baseline recorded before go-live, so month-one comparison is honest, not invented.

☐ **Continuous Improvement** — Every post-launch finding is run through Section 10's own eight-step sequence before any action is taken.

---

## Section 12 — Ten-Year Test: 10,000 institutions

Would this deployment model hold at 10,000 institutions — schools, hospitals, factories, governments, NGOs, temples, churches, manufacturers, software companies, universities? **The document itself would hold; the organization executing it would not, without one thing this document cannot supply on its own.** This is the identical honest gap the Design System and the Extension Development Standard each already found in themselves: a written standard, however precise, is not self-enforcing at scale. At 10,000 institutions, two real, previously-unaddressed needs surface, neither requiring new architecture:

- **A genuine deployment-partner network** — certified deployment teams beyond ARUMBU's own core team, held to this document's own standard, echoing the Extension Development Standard's own certification-body finding, applied here to people who deploy rather than people who build.
- **A real, cross-institution findings-aggregation mechanism** — risk #49 already names this precisely: without it, the same real deployment mistake gets independently rediscovered at institution after institution, at a cost that compounds with every deployment that doesn't have visibility into the ones before it.

Naming this here, honestly, at the close of the Architecture & Design Phase, is itself the final piece of evidence this entire multi-document series has been building toward: **the architecture has already been tested harder than almost any platform this young ever is, and it held. What remains is not a design question. It is the ordinary, unavoidable work of running something well, at scale, for a long time — which no document, however complete, was ever going to be able to do by itself.**

---

## The Twenty Laws of Successful ARUMBU Deployment

1. No deployment begins without a real, named leadership commitment and a real, named operational champion — no exceptions.
2. Discovery happens before data touches the platform, never alongside it.
3. Migrate the smallest, most self-contained data first — never the most important.
4. Nothing migrates without passing the Universal Record Model's own three-property test.
5. Every migration step has a tested rollback before it ever runs against real data.
6. Parallel running has one single source of truth for real money, stated in advance, never left ambiguous.
7. Training is persona-scoped and hands-on — never a platform tour.
8. A person is trained when they can complete their own core flow independently, not when they've attended a session.
9. The pilot touches real, live, consequential work — never a sandbox pretending to be one.
10. Exit criteria require a sustained period, never a single good day.
11. Rollback criteria are named before go-live, not improvised during a crisis.
12. Expand one dimension at a time — department or application, never both together.
13. Notifications cut over cleanly on go-live day — never a slow bleed of double alerts.
14. Deployment is the beginning of Adoption, never its conclusion.
15. Support tapers; it never falls off a cliff.
16. Every post-deployment finding is classified before it's acted on — resolved by existing architecture, implementation backlog, configuration, or convention, almost always; constitutional amendment, almost never.
17. Areas of Responsibility are named as nouns from day one — never a bare verb waiting to rot.
18. Terminology capture is a standing practice, not a one-time interview.
19. A stuck decision with no current Area holder is a go-live blocker, not a background task.
20. Every institution's own hardest lesson gets written down where the next institution can find it.
