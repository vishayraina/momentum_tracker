---
name: ui-review
description: Ensures consistency and simplicity in the UI.
disable-model-invocation: true
---
# UI Reveiw

Keep the Momentum Tracker frontend visually consistent, simple, and intentional.

## Rules

* Reuse existing components, styles, design tokens, fonts, colors, spacing, and button patterns.
* Do not invent one-off font sizes, colors, spacing, radii, cards, or controls unless genuinely necessary.
* Keep visual hierarchy clear and avoid clutter.
* **Remove redundant UI.** Before finishing, look for duplicate buttons, duplicate actions, unnecessary labels, filters, cards, navigation items, and decorative elements. If something is not useful, remove it.
* Do not add UI merely to fill empty space.
* Keep the product calm and information-focused; do not turn it into a task manager or generic productivity dashboard.
* Make new UI responsive on desktop and mobile.
* Prefer one obvious action over several competing actions.

## Browser QA

When Chrome DevTools MCP is available, use it to test the actual rendered application.

Work iteratively:

1. Open the page and establish the correct viewport.
2. Interact with the page like a real user.
3. Try all important buttons, links, navigation, tabs, filters, forms, dropdowns, modals, and create/edit/delete flows.
4. After navigation or a major UI state change, inspect the current page again. Do not rely on stale screenshots or snapshots.
5. Use full-page screenshots when visual inspection of the whole page is needed. Make sure the screenshot corresponds to the current page and viewport.
6. Check typography, colors, spacing, alignment, sizing, responsive behavior, and console errors.
7. Compare the page with the rest of the application.
8. Find discrepancies, bugs, confusing interactions, and redundant UI.
9. Fix what you find.
10. Test the affected interaction again.
11. Repeat the inspect → interact → find → fix → retest loop until the UI is coherent.
12. Finish with: "What can I remove, simplify, or make more consistent?"

If the screenshot tool appears to be capturing a stale or incorrect region, do not trust the screenshot. Re-establish the viewport/current page and retry using a full-page screenshot or inspect the rendered DOM/layout directly.

## Product Principle

The UI should help the user see what matters and what is moving.

Do not add streaks, daily task lists, guilt mechanisms, arbitrary scores, or unnecessary AI/productivity features unless explicitly required by the product specification.
