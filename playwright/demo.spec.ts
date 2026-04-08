import { expect, test } from '@playwright/test';

test.describe('demo pages', () => {
  // 一覧ページから各デモへ遷移できること。
  test('navigates from index to each demo page', async ({ page }) => {
    await page.goto('/index.html');

    await expect(page.getByRole('heading', { name: 'Haori.js Bootstrap Demo' })).toBeVisible();
    await expect(page.getByRole('link', { name: '基本 API デモを開く' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'checkbox / radio デモを開く' })).toBeVisible();

    await page.getByRole('link', { name: '基本 API デモを開く' }).click();
    await expect(page).toHaveURL(/\/api\.html$/);
    await expect(page.getByRole('heading', { name: '基本 API デモ' })).toBeVisible();

    await page.getByRole('link', { name: 'checkbox / radio デモ' }).click();
    await expect(page).toHaveURL(/\/checkbox-radio\.html$/);
    await expect(page.getByRole('heading', { name: 'Checkbox / Radio Message Demo' })).toBeVisible();
  });

  // 基本 API デモで dialog、confirm、toast、modal、メッセージ管理が動作すること。
  test('executes the core api demo interactions', async ({ page }) => {
    await page.goto('/api.html');

    await expect(page.locator('#status')).toContainText('BootstrapHaori が有効です。');

    await page.locator('#show-dialog').click();
    const dialogModal = page.locator('[data-haori-bootstrap-dialog="true"]');
    await expect(dialogModal).toContainText('Haori.js Bootstrap の dialog サンプルです。');
    await dialogModal.getByRole('button', { name: 'OK' }).click();
    await expect(dialogModal).toHaveCount(0);

    await page.locator('#show-confirm').click();
    const confirmModal = page.locator('[data-haori-bootstrap-dialog="true"]');
    await expect(confirmModal).toContainText('confirm の挙動を確認しますか。');
    await confirmModal.getByRole('button', { name: 'OK' }).click();
    await expect(page.locator('#status')).toContainText('confirm は true を返しました。');

    await page.locator('#show-toast').click();
    const toast = page.locator('[data-haori-bootstrap-toast="true"]').last();
    await expect(toast).toContainText('toast を表示しました。');
    await expect(toast).toHaveClass(/text-bg-warning/);

    await page.locator('#open-existing-dialog').click();
    const existingDialog = page.locator('#existing-dialog');
    await expect(existingDialog).toHaveClass(/show/);
    await page.locator('#close-inside-dialog').click();
    await expect(existingDialog).not.toHaveClass(/show/);

    const sampleInput = page.locator('#sample-input');
    await page.locator('#add-message').click();
    await expect(sampleInput).toHaveClass(/is-invalid/);
    await expect(page.locator('[data-haori-bootstrap-message-container="true"]')).toContainText(
      '入力内容を確認してください。',
    );

    await page.locator('#clear-message').click();
    await expect(sampleInput).not.toHaveClass(/is-invalid/);
    await expect(page.locator('[data-haori-bootstrap-message-container="true"]')).toHaveCount(0);
  });

  // checkbox と radio のデモで専用メッセージ配置とクリアが動作すること。
  test('shows and clears choice-input messages in the dedicated demo', async ({ page }) => {
    await page.goto('/checkbox-radio.html');

    await page.getByRole('button', { name: 'エラー表示' }).first().click();
    const checkboxWrapper = page.locator('#checkbox-wrapper');
    await expect(
      checkboxWrapper.locator('[data-haori-bootstrap-message-container="true"]'),
    ).toContainText('利用規約への同意が必要です。');
    await expect(page.locator('#terms-checkbox')).toHaveClass(/is-invalid/);

    await page.getByRole('button', { name: 'クリア' }).first().click();
    await expect(
      checkboxWrapper.locator('[data-haori-bootstrap-message-container="true"]'),
    ).toHaveCount(0);
    await expect(page.locator('#terms-checkbox')).not.toHaveClass(/is-invalid/);

    await page.getByRole('button', { name: 'エラー表示' }).nth(1).click();
    const radioGroup = page.locator('#radio-group');
    await expect(
      radioGroup.locator('[data-haori-bootstrap-message-container="true"]'),
    ).toContainText('いずれかの選択肢を選んでください。');
    await expect(page.locator('#sample-radio-a')).toHaveClass(/is-invalid/);
    await expect(page.locator('#sample-radio-b')).toHaveClass(/is-invalid/);

    await page.getByRole('button', { name: 'クリア' }).nth(1).click();
    await expect(
      radioGroup.locator('[data-haori-bootstrap-message-container="true"]'),
    ).toHaveCount(0);
    await expect(page.locator('#sample-radio-a')).not.toHaveClass(/is-invalid/);
    await expect(page.locator('#sample-radio-b')).not.toHaveClass(/is-invalid/);
  });
});