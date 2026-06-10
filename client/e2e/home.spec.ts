import { test, expect } from '@playwright/test';

test('home page shows the downloader form', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByPlaceholder(/twitter\.com/i)).toBeVisible();
  // The format toggle exposes MP4 / MP3 radios.
  await expect(page.getByRole('radio', { name: /MP4/i })).toBeVisible();
  await expect(page.getByRole('radio', { name: /MP3/i })).toBeVisible();
});

test('rejects an empty submit (required field)', async ({ page }) => {
  await page.goto('/');
  const input = page.getByPlaceholder(/twitter\.com/i);
  await expect(input).toHaveAttribute('required', '');
});
