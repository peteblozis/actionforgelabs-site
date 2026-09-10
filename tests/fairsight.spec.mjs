import { test, expect } from '@playwright/test';

test('Fairsight HT1 controlled human-test journey', async ({ page }) => {
  await page.goto('/tester/fairsight/');
  await expect(page.locator('h1')).toHaveText('Fairsight');
  await expect(page.locator('[data-release="FAIRSIGHT-HT1"]')).toBeVisible();
  await expect(page.getByText('Before you buy it, ask Fairsight.')).toBeVisible();
  await page.getByRole('button', { name: 'ASK FAIRSIGHT' }).click();
  await expect(page.getByText('BUY NOW')).toBeVisible();
  await expect(page.getByText('Fairsight BuyPoint')).toBeVisible();
  await expect(page.getByText('Accuracy Ledger Preview')).toBeVisible();
  await expect(page.getByText(/TEST FIXTURE:/)).toBeVisible();
  await expect(page.getByText(/No live-price claim made/)).toBeVisible();
});

test('Fairsight refuses blank text input', async ({ page }) => {
  await page.goto('/tester/fairsight/');
  await page.locator('#query').fill('');
  await page.getByRole('button', { name: 'ASK FAIRSIGHT' }).click();
  await expect(page.locator('#status')).toHaveText('Provide a product first. Fairsight will not guess.');
  await expect(page.locator('#result')).toHaveClass(/hidden/);
});
