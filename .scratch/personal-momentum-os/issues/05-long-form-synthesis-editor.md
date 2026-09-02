# 05: Long-Form Synthesis Reflection Editor & Knowledge Capture

**What to build:** The user can write and store long-form reflective Syntheses (Markdown / rich text) linked to a Priority and its active Goal. Creating a Synthesis records a `SYNTHESIS` progress event and stores the full document content, resetting the derived Cook Session count since last synthesis. The user can browse, read, and edit past syntheses on the Priority detail screen.

**Blocked by:** 03: Rapid Progress Event Logging & Timeline Audit

**Status:** ready-for-agent

- [ ] Dedicated Synthesis writing interface supporting Markdown formatting and title.
- [ ] Saving a Synthesis creates both a `ProgressEvent(type=SYNTHESIS)` timeline anchor and a linked `Synthesis` document record.
- [ ] Priority detail page renders the synthesis archive and preview.
- [ ] Synthesis creation accurately resets the derived "Cook Sessions since last synthesis" counter.
- [ ] Automated tests verify synthesis creation, document retrieval, and session-gap derivation.
