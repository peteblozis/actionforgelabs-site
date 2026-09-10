# Fairsight interface pilot — September 10, 2026

Implementation: FAIRSIGHT-INTERFACES-PILOT-1.
Base: feature/worth-it-relaunch, 121fe735b7ffadf10af945f30f9d2bc9a50d7828 (PR #11).
Scope: three approved interface extensions; production release is separate.

## What is implemented

Opt in at the existing tester route /tester/buypoint/?pilot=interfaces.
The established route and non-pilot experience remain available.

1. Chat commands, speech transcripts, and screen controls share a transactional dispatcher for budget, target, save, watch intent and explanation. Request tokens are idempotent, conflicting token reuse is rejected, and watch intents are unique by exact product ID. Target changes update an existing watch threshold.
2. IndexedDB holds a device-local product/evidence snapshot, preferences, saved items, watch intents, and receipts. Reload restores context. Transactions serialize concurrent tabs; BroadcastChannel refreshes their displays. This is explicitly a same-browser pilot, not server storage or cross-device sync. Legacy localStorage records are not silently migrated; disable the pilot to view the original saved list.
3. Each command records interface, action, build, timestamps, processing duration, success/failure, execution error, correction flag and evidence mode in the same transaction as state. Unknown cost, assistance need and independently measured accuracy remain unknown. Export provides the workspace and receipts as JSON. Processing duration is not human task-completion time.

Commands are a deliberately bounded grammar: budget 15, set budget to $15, target 11, watch price, save item, explain. Unsupported commands fail explicitly. This is not a connected ChatGPT/Claude tool or general conversational model. Voice recognition depends on browser support; physical microphone operation has not been verified.

## Validation

Eight IndexedDB contract tests passed locally using fake-indexeddb: duplicate/retry prevention; persisted budget/target/evidence after reopen; concurrent connections; failed input; conflicting request tokens; watch threshold correction; voice-source command routing; storage failure.

Fourteen browser checks are committed (seven existing regression checks plus seven pilot checks). Local browser execution was blocked before tests ran because the matching browser binary was unavailable; browser download returned HTTP 502. The managed browser could not access the loopback preview. Browser checks must not be reported as passed without a successful CI receipt. The dedicated CI workflow runs both contract and browser suites.

## Remaining gates

- Successful browser test receipt, including rendered budget-to-conversation continuity.
- Fresh-session/mobile provider validation remains separate from fixture interface tests.
- No scheduled price monitoring, delivered notifications, cross-device sync, provider charge measurement, user assistance measurement, or accuracy outcomes are claimed by this pilot.
- Actual human task-time and usability comparison remains pending a user session.
- Review and merge/release require the appropriate production decision; this change does not authorize a production release.

## Rollback and continuation

Remove ?pilot=interfaces to return to the existing tester experience. Pilot data uses its own database and does not overwrite original saved data. To remove implementation, revert this pilot commit. Continue from the pilot branch and this document; the originating conversation is not required.
