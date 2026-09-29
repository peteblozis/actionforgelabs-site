# BuySignal Acceptance Tests

## Tester Build Acceptance
- Tester hub shows BuySignal card.
- BuySignal opens from /tester/buysignal/index.html.
- Legacy /tester/pricewatch/index.html redirects to BuySignal.
- User can add item.
- User can edit item.
- User can delete item.
- Exact variant/size field is visible.
- Target price field works.
- Current test price field works.
- Coupon/net-price adjustment field works.
- Effective price = current price minus adjustment.
- BUY NOW appears only when active and effective price <= target price.
- WAIT appears when active and effective price > target price.
- PAUSED appears when item is paused.
- CSV export works.
- CSV import works.
- Tester feedback export works.
- No Pete personal data appears.

## Deployment Acceptance
- GitHub Desktop shows no uncommitted files after commit.
- GitHub remote contains tester/buysignal/index.html.
- Cloudflare deploy completes.
- https://actionforgelabs.com/tester/ shows BuySignal.
- https://actionforgelabs.com/tester/buysignal/ loads the tester app.
