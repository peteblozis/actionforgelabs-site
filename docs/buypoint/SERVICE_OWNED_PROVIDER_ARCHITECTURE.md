# BuyPoint — Service-Owned Provider Architecture

**Status:** implementation architecture / no spend or provider secret authorized by this document  
**Decision owner:** Pete  
**Customer requirement:** a BuyPoint purchaser must never be asked to obtain, enter, store, or manage an AI/provider API key.

## Product contract

BuyPoint is a normal customer product. The browser/mobile client calls only the BuyPoint service. Provider credentials exist only in server-side secret storage controlled by the BuyPoint service owner.

Customer -> BuyPoint UI -> authenticated BuyPoint API -> server-side provider adapter -> provider(s)

The client bundle MUST NOT contain provider API keys, provider bearer tokens, or an API-key input field. Provider credentials MUST NOT be returned by any endpoint, log, Flight Recorder export, error body, or browser storage.

## Credential ownership

Production credentials are organization/service-owned credentials for BuyPoint, not Pete's personal credentials and not customer credentials. The service-owned provider account and billing arrangement require separate owner approval before production activation or spend.

## Provider abstraction

The customer UI is provider-independent. It sends a normalized product-resolution request to `/api/buypoint/resolve`. The server selects an approved provider adapter. This permits provider replacement without changing the customer workflow and prevents customers from needing provider accounts.

Required server configuration may include service-owned secrets such as `BUYPOINT_OPENAI_API_KEY`, but those names are deployment implementation details and are never exposed as customer setup requirements.

## Access and abuse controls required before Release 2

1. Exact allowed customer/tester origin enforcement.
2. Authentication or protected tester access before non-owner testing.
3. Server-side rate limits and request-size limits.
4. Per-request timeout and bounded provider output.
5. No secret values in logs or Flight Recorder.
6. Fail closed when provider credentials are absent or provider evidence is insufficient.
7. Exact product/variant matching and source-backed current offers.
8. Cost telemetry by request without recording provider secrets or unnecessary personal data.
9. Kill switch for provider calls.
10. A spend ceiling/budget alert must be configured before public production.

## Customer experience

A customer signs into/opens BuyPoint and uses product name, barcode, URL, photo, or voice as supported. There is no API-key setup screen. If the BuyPoint service is unavailable, the product reports that the service is temporarily unavailable; it never asks the customer to insert a provider key as a workaround.

## Release gates

CODE PASS is not DEPLOYMENT PASS and is not USER PASS. Release 2 remains denied until an isolated BuyPoint provider origin is deployed, a service-owned credential arrangement is approved and configured server-side, protected access is proven, exact deployed identity is evidenced, and fresh mobile/desktop + Flight Recorder acceptance passes.

No production provider purchase, billing change, secret insertion, public release, or production deployment is authorized by this architecture document.