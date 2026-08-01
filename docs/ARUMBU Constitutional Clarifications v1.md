Status: 🟢 Frozen v1 — a direct, scoped resolution of three specific findings from the ARUMBU Constitution Ratification Review v1: the "Organization"/"Provider"/"Customers" vocabulary collisions, the Policy → Business Rule refresh silence, and the drift between Product Foundation §7's engine roster and the architecture as actually built. Nothing below invents a new constitutional principle, redesigns a domain, or reopens Governance, Attention, Authority's resolution logic, or Tamizhi's philosophy. Where a frozen document's specific claim is superseded here, that document is not edited — per the discipline already established by Institution Setup Experience v2's own supersession of v1, the frozen document stays exactly as written, and this document is the authoritative correction for anyone reading them together.

# ARUMBU Constitutional Clarifications v1

## Part 1 — Vocabulary Ratification

Three collisions were found; this section resolves all three by declaring exactly one canonical meaning per contested word, going forward, in every future constitutional or documentation use. No code is renamed by this document — these are documentation and naming conventions, binding on prose and on any future document, not a mandate to rename existing types, tables, or components. Where a future implementation pass finds it cheap to align code naming with the canonical terms below, it may; nothing here requires it.

### "Organization"

**Canonical meaning, unqualified, permanently: the internal reporting graph — Positions and the edges between them (People Domain Review v1; Product Foundation §10's `org-builder/`; the live Organization Canvas built in M4).** This is the older, more load-bearing sense — it is a first-class Application Layer concept with real, shipped machinery behind it, and it keeps the word.

**The second sense — an external company or institution tracked as a Contact (introduced in the ARUMBU Community Domain Reconsideration v1's "Organization as a first-class Contact kind")** never gets to use the bare word "Organization" again in constitutional or documentation prose. It is redesignated **"Organization Contact"** wherever it needs distinguishing from the internal sense, and **"a Contact of Organization kind"** in fuller prose. This is a naming clarification only — nothing about the Community Domain Reconsideration's actual model changes; a temple's donor organization is exactly as real and exactly as tracked as it was before this document, it is simply never called bare "Organization" in a sentence that could also be talking about the org chart.

**Why this direction, not the reverse:** the internal sense predates the external one by several milestones, has a shipped canvas, a shipped folder name, and a People Domain Review built entirely around it — renaming the newer, less-embedded concept costs less than renaming the older, more load-bearing one.

### "Provider"

**Four distinct, precisely-named senses exist across the corpus. None of them is ever "Provider" unqualified again, in any future constitutional or documentation prose:**

1. **Domain Provider** — the `provider.ts` interface every application's four-file discipline is built around (Identity Provider, Work Provider, Finance Provider, and so on, one per domain). This is the oldest and most structurally central sense.
2. **Identity Provider** — an external authentication source a person signs in through (Google, Microsoft, a future enterprise SSO source), per Platform Integration Strategy §3's "portable identity" and Enterprise Foundation §2.1/§2.5.
3. **Search Provider** — the still-dormant sense named in Product Foundation §5 and Platform Integration Strategy §4 ("a more capable provider registers the same way every other one does") — not built as a literal registry yet (Search's own adapters were, correctly, never named "providers" in code, per the Ratification Review's own observation that this was the right instinct), but reserved here as the term's third meaning for whenever that registry is actually built.
4. **Tamizhi Provider** — an implementation of the `TamizhiProvider` interface (`rule-engine-v1` today; a future OpenAI/Claude/Gemini/local-model implementation later), per Institution Intelligence Principles and Enterprise Foundation §9.

**The disambiguation rule going forward:** any future document, comment, or conversation that uses "provider" without one of the four qualifiers above is presumptively unclear and should be corrected on sight — this is not a stylistic preference, it is the direct fix for a collision the Ratification Review found spanning three architecture layers at once.

### "Customers" / "Community"

**Canonical meaning, permanently: "Community."** Product Foundation §4's own application table — "Customers... Who are we serving?" — is hereby annotated as **superseded in name only** by every document from the ARUMBU Community Domain Review v1 onward, the live `applications/community/` folder, and the Master Roadmap's own dashboard. Product Foundation's text is not edited (per this corpus's own established discipline of never editing a frozen document in place); this section is the authoritative record that "Customers," wherever it appears in Product Foundation §4, means exactly what every later document, and the shipped application, calls "Community."

**Why this direction:** "Customers" was the correct word for an agency-shaped platform's first pass at naming this domain; "Community" is the word the actual, later, more rigorous domain design (three universal Directions — Receiving/Supporting/Supplying — rather than a single customer-vendor relationship) earned once that design was done properly. A temple's devotees and an NGO's beneficiaries were never honestly "customers"; renaming to the word the real model deserves is not drift, it's the model correcting its own first guess, and this document is simply the first place that says so plainly rather than leaving two names live simultaneously.

---

## Part 2 — Policy → Business Rule Lifecycle Clarification

**The gap, restated precisely from the Ratification Review:** the Institutional Policy Model already states "a Business Rule is the compiled, machine-readable residue of a Policy — never the Policy itself" and that every Business Rule "should be traceable back to a Policy that justifies it." What was never specified: what happens to an already-compiled Business Rule the moment the Policy it was compiled from is Superseded (§3 of that document).

**The resolution, extending the Institutional Policy Model's own existing mechanisms — no new engine, no new Record type beyond what Enterprise Foundation §7 already named:**

1. **Every Business Rule is version-pinned**, not merely Policy-pinned — it carries a reference to the *specific version* of the Policy it was extracted from, not just the Policy's identity. This was already implicit in Enterprise Foundation §7.3/§7.8 and is made explicit here as the load-bearing fact the rest of this resolution depends on.
2. **Superseding a Policy never silently changes any Business Rule already compiled from its prior version.** An application reading that Business Rule today continues reading exactly the value it already had — this is the same "corrections are new records, never edits" discipline the Audit Engine already applies to everything else in the platform (Audit Engine Design), applied here to the relationship between a Policy and its own compiled residue rather than to the Policy record itself.
3. **Supersession marks every Business Rule compiled from the now-superseded version as `stale — pending refresh`.** This is a fact about the Business Rule, not an error state and not a silent auto-update. It is surfaced as an ordinary Act Now item — "The Purchasing threshold hasn't been refreshed since the Purchasing Policy was updated" — through the identical Attention Contract every other application-layer fact already reaches Home through (Product Foundation §4). No new notification mechanism is invented; this is one more Act Now contributor, exactly like a vacant Position or an expiring Document.
4. **Refreshing a stale Business Rule is a real, named, auditable act** — not automatic, and not a full re-Approval (the Policy itself is already approved; only its compiled numeric residue needs re-extracting). Performed by whoever holds the Area of Responsibility the Policy itself belongs to (Institutional Policy Model §5), narrated to History in the same plain sentence style as every other institutional act ("Priya refreshed the Purchasing threshold to match the current Purchasing Policy").

**What this resolution deliberately does not do:** it does not make Policy Supersession automatically propagate — an institution's actual operating numbers never change underneath an application without a human noticing and acting, which is exactly the "software convenience never outweighs institutional truth" standard Product Philosophy sets, applied here to prevent a Policy edit from silently moving a live approval threshold with nobody aware it happened.

---

## Part 3 — Engine Terminology Reconciliation

**The finding, restated precisely from the Ratification Review:** Product Foundation §7 names eight Shared Engine Layer members — Work, Authorization, Notifications, Documents, Workflow, Events, Assignment, Audit. The live `engines/` folder, after thirteen milestones, contains exactly three: `authority`, `search`, `tamizhi`. Product Foundation §1's five-layer *principle* is not in question and is not touched by this reconciliation. What is corrected here is only the *specific roster* §7 named, which the Ratification Review recommended demoting to a living, non-frozen inventory rather than leaving frozen in a state the real platform has already outgrown.

**The current, authoritative Shared Engine Layer roster, as of this reconciliation — living, not frozen, updated the same way the Master Roadmap already is whenever an engine's status changes:**

| Named in Foundation §7 | Current status | Where it actually lives |
|---|---|---|
| **Authorization** | ✅ Real, built | `engines/authority/` — same concept Foundation §7 described, ported under its precise Governance name rather than the generic "Authorization" |
| **Work** | 🔁 Reclassified | Never built as a separate generic engine. Its institution-agnostic machinery (Task/Approval shapes, state transitions) lives entirely inside `applications/work/`'s own `types.ts`/`provider.ts` separation. This is an accepted architectural evolution, not a broken promise: the *principle* Foundation §7 credited this engine for — "template-driven... never needed to know about any specific business process to run one" — still holds, inside the application, rather than one layer up. Formally retired as a separate Shared-Engine-Layer citizen. |
| **Documents** | 🔁 Reclassified | Same pattern as Work — M10 built a full, opinionated Application Layer citizen (`applications/documents/`) rather than a generic attachment engine other applications consume. Formally retired as a separate Shared-Engine-Layer citizen for the identical reason. |
| **Audit** | 🔁 Reclassified | Lives today inside the Operating System Layer, at `os/attention/history-store.ts`, as a simplified, non-database preview of the real engine the Audit Engine Design specifies — not yet promoted to its own Shared Engine Layer citizen. This is itself a deviation from Foundation §7's original plan, named and accepted here rather than left implicit; the Audit Engine Design's own frozen shape is unaffected and remains exactly what a real `engines/audit/` should eventually implement. |
| **Notifications** | ⏳ Still real, still unbuilt | No implementation exists anywhere yet — not `engines/`, not `os/`, not folded into an application. Remains a named, expected future Shared Engine Layer citizen exactly as Foundation §7 described it; the Domain Audit performed in the Ratification Review separately confirmed this is the single most-cited-but-never-designed gap in the entire corpus. |
| **Workflow** | ⏳ Still real, still unbuilt | No implementation exists. Remains named and expected. |
| **Events** | ⏳ Still real, still unbuilt | No implementation exists as a distinct engine; every application currently narrates directly to History rather than emitting through a real Events layer first. Remains named and expected — Enterprise Foundation §10.9 already depends on this engine existing eventually and names it as a precondition for Search's incremental indexing and Audit's synchronous guarantee. |
| **Assignment** | ⏳ Still real, still unbuilt | No implementation exists. Remains named and expected. |
| *(not in Foundation §7 at all)* **Search** | ✅ Real, built, reclassified | Originally placed in the Operating System Layer by Foundation §5 ("ports near-verbatim... an Operating System Layer piece"). Actually built at `engines/search/`. Formally reclassified here as a Shared Engine Layer citizen — the correct home for it in retrospect, since it is genuinely institution-agnostic machinery every application-layer domain plugs an adapter into, which is precisely Foundation §7's own definition of what belongs in this layer. |
| *(did not exist when Foundation froze)* **Tamizhi** | ✅ Real, built | `engines/tamizhi/` — a third Shared Engine Layer citizen, correctly placed from the moment it was designed (Platform Integration Strategy §4 already reasoned about it at this altitude before it had a folder). |

**What this table settles:** the Shared Engine Layer, as it exists today, has three real members — Authority, Search, Tamizhi — and four named, still-legitimate, still-unbuilt future members — Notifications, Workflow, Events, Assignment. Work, Documents, and (for now) Audit are not Shared Engine Layer citizens in practice, and this document stops pretending otherwise. None of this required touching Product Foundation §1's actual layering principle, which this reconciliation confirms, again, holds without exception.

**This table is explicitly not frozen** — per the Ratification Review's own recommendation, it is a living inventory, updated the same day an engine's status changes, the same operational discipline the Master Roadmap already applies to milestones. The five-layer *principle* this reconciliation extends remains frozen exactly as Product Foundation §1 states it.
