# Prompt Lessons — commercial offer and fulfillment specification (DRAFT, not published)

Status: DEVELOPMENT ONLY. Owner approval required for price, production promotion, and external customers. Commercial gate: peteblozis/forge-factory#53.

## Buyer-facing offer (proposed copy)
**Prompt Lessons: Eight Practical Lessons for Getting Better Results from AI**
Learn to turn vague requests into clear instructions, specify the desired output, test the result, and revise with confidence. Eight self-paced lessons and a practice quiz. Designed for people who want practical AI skills without programming.

**Includes:** Access to the eight existing lessons, navigation between lessons, and the practice quiz once verified in the deployed buyer experience.

**Price:** PENDING OWNER APPROVAL — no price or checkout button may be shown as live until approved and connected to a verified Freemius product.

**Important limitations:** Educational material, not a certification, personal consulting, or a promise that AI output will always be accurate. Do not advertise completion certificates or lifetime access unless independently verified and approved.

## Acceptance path (evidence required, no synthetic PASS)
1. Approved product name, exact price, tax/refund terms, and buyer-facing description recorded with approval date.
2. Freemius sandbox product/plan and hosted checkout URL recorded from authenticated administrator console; no invented URL.
3. Complete sandbox purchase, retain actual transaction ID and time; verify webhook signature and deduplicate event.
4. Read back the corresponding entitlement/license from Freemius, then verify a buyer with entitlement can access all eight lessons and quiz; a buyer without entitlement must be denied if the offer promises restricted access.
5. Verify onboarding link arrives to a controlled test inbox; confirm lesson delivery and support instructions.
6. Confirm actual incoming messages at feedback@actionforgelabs.com and testers@actionforgelabs.com, not just Gmail SENT.
7. Confirm consent-appropriate conversion events with no sensitive buyer data exposed publicly.
8. Test public vs protected routes, including that SageForge Core is never exposed to purchasers or testers.
9. Preserve commit SHA, CI run, staging readback, independent review, and rollback evidence. Request owner approval before production deployment.

## Blocker ownership
- Repository and tests: SFC execution workflow (authorized development).
- Freemius admin authentication and price approval: Pete only at explicit approval gate.
- Mail domain configuration: authorized admin; must verify inbound delivery.
- Production merge, deploy and customer outreach: require Pete's separate approval.

## Stop condition
Never claim sale-ready on content-only tests. The commercial-readiness gate in PR #28 requires source-bound external receipts. No invented purchase, license, price, or live URL.
