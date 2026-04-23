import { expect, test } from '@playwright/test';

test.describe('demo pages', () => {
  // 一覧ページから各デモへ遷移できること。
  test('navigates from index to each demo page', async ({ page }) => {
    await page.goto('/index.html');
    const choiceInputDemoLink = page.locator(
      'a[href="./checkbox-radio.html"]',
      {hasText: 'checkbox / radio デモを開く'},
    );

    await expect(page.getByRole('heading', { name: 'Haori.js Bootstrap Demo' })).toBeVisible();
    await expect(page.getByRole('link', { name: '基本 API デモを開く' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Procedure 連携デモを開く' })).toBeVisible();
    await expect(choiceInputDemoLink).toBeVisible();
    await expect(page.getByRole('link', { name: 'CDN デモを開く' })).toBeVisible();

    await page.getByRole('link', { name: '基本 API デモを開く' }).click();
    await expect(page).toHaveURL(/\/api\.html$/);
    await expect(page.getByRole('heading', { name: '基本 API デモ' })).toBeVisible();

    await page.goto('/index.html');
    await page.getByRole('link', { name: 'Procedure 連携デモを開く' }).click();
    await expect(page).toHaveURL(/\/procedure\.html$/);
    await expect(page.getByRole('heading', { name: 'Procedure 連携デモ' })).toBeVisible();

    await page.goto('/index.html');
    await choiceInputDemoLink.click();
    await expect(page).toHaveURL(/\/checkbox-radio\.html$/);
    await expect(page.getByRole('heading', { name: 'Checkbox / Radio Message Demo' })).toBeVisible();
    
    await page.goto('/index.html');
    await page.getByRole('link', { name: 'CDN デモを開く' }).click();
    await expect(page).toHaveURL(/\/cdn\.html$/);
    await expect(page.getByRole('heading', { name: 'CDN デモ' })).toBeVisible();
  });

  // Procedure 互換 demo で data-click-*-message の複数行 message が表示されること。
  test('executes the procedure compatibility demo interactions', async ({ page }) => {
    await page.goto('/procedure.html');

    await expect(page.locator('#procedure-status')).toContainText(
      'Procedure 互換の data-click-* モックが有効です。',
    );

    await page.getByRole('button', { name: 'data-click-dialog' }).click();
    const dialogModal = page.locator('[data-haori-bootstrap-dialog="true"]');
    await expect(dialogModal.locator('.modal-body p')).toContainText('1行目の案内です。');
    await expect(dialogModal.locator('.modal-body p')).toContainText('2行目の補足も表示されます。');
    await dialogModal.getByRole('button', { name: 'OK' }).click();
    await expect(page.locator('#procedure-status')).toContainText('data-click-dialog を実行しました。');

    await page.getByRole('button', { name: 'data-click-confirm' }).click();
    const confirmModal = page.locator('[data-haori-bootstrap-dialog="true"]');
    await expect(confirmModal.locator('.modal-body p')).toContainText('ユーザーを削除しますか。');
    await expect(confirmModal.locator('.modal-body p')).toContainText('この操作は元に戻せません。');
    await confirmModal.getByRole('button', { name: 'OK' }).click();
    await expect(page.locator('#procedure-status')).toContainText(
      'data-click-confirm は true を返しました。',
    );

    await page.getByRole('button', { name: 'data-click-toast' }).click();
    const toast = page.locator('[data-haori-bootstrap-toast="true"]').last();
    await expect(toast.locator('.toast-body')).toContainText('保存しました。');
    await expect(toast.locator('.toast-body')).toContainText('一覧を再読み込みしてください。');
    await expect(page.locator('#procedure-status')).toContainText('data-click-toast を実行しました。');
  });

  // 基本 API デモで dialog、confirm、toast、modal、メッセージ管理が動作すること。
  test('executes the core api demo interactions', async ({ page }) => {
    await page.goto('/api.html');

    await expect(page.locator('#status')).toContainText('BootstrapHaori が有効です。');

    await page.locator('#show-dialog').click();
    const dialogModal = page.locator('[data-haori-bootstrap-dialog="true"]');
    const dialogMessage = dialogModal.locator('.modal-body p');
    await expect(dialogMessage).toContainText('Haori.js Bootstrap の dialog サンプルです。');
    await expect(dialogMessage).toContainText('2行目も表示されます。');
    await expect(dialogMessage).toHaveCSS('white-space', 'pre-line');
    await dialogModal.getByRole('button', { name: 'OK' }).click();
    await expect(dialogModal).toHaveCount(0);

    await page.locator('#show-confirm').click();
    const confirmModal = page.locator('[data-haori-bootstrap-dialog="true"]');
    await expect(confirmModal).toContainText('confirm の挙動を確認しますか。');
    await expect(confirmModal.locator('.modal-body p')).toContainText('この操作はデモ用の表示確認です。');
    await confirmModal.getByRole('button', { name: 'OK' }).click();
    await expect(page.locator('#status')).toContainText('confirm は true を返しました。');

    await page.locator('#show-toast-info').click();
    const toastContainer = page.locator('[data-haori-bootstrap-toast-container="true"]');
    const toast = page.locator('[data-haori-bootstrap-toast="true"]').last();
    await expect(toastContainer).toHaveClass(/bottom-0/);
    await expect(toastContainer).toHaveClass(/end-0/);
    await expect(toast).toContainText('info の toast を表示しました。');
    await expect(toast.locator('.toast-body')).toContainText('2行目の通知です。');
    await expect(toast.locator('.toast-body')).toHaveCSS('white-space', 'pre-line');
    await expect(toast).toHaveClass(/bg-body/);
    await expect(toast).toHaveClass(/text-body/);
    await expect(toast.locator('[data-haori-bootstrap-toast-accent="true"]')).toHaveClass(/bg-info/);

    await page.locator('#show-toast-warning').click();
    const warningToast = page.locator('[data-haori-bootstrap-toast="true"]').last();
    await expect(warningToast.locator('.toast-body')).toContainText('warning の toast を表示しました。');
    await expect(warningToast.locator('.toast-body')).toContainText('確認が必要な通知です。');
    await expect(
      warningToast.locator('[data-haori-bootstrap-toast-accent="true"]'),
    ).toHaveClass(/bg-warning/);

    await page.locator('#show-toast-error').click();
    const errorToast = page.locator('[data-haori-bootstrap-toast="true"]').last();
    await expect(errorToast.locator('.toast-body')).toContainText('error の toast を表示しました。');
    await expect(errorToast.locator('.toast-body')).toContainText('対応が必要な通知です。');
    await expect(errorToast.locator('[data-haori-bootstrap-toast-accent="true"]')).toHaveClass(/bg-danger/);

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

  // CDN デモで公開済み配布物の読み込み成功と主要 UI 操作が確認できること。
  test('executes the published CDN demo interactions', async ({ page }) => {
    await page.goto('/cdn.html');

    await expect(page.locator('#status')).toContainText(
      'CDN 版 Haori.js Bootstrap 0.3.0 が有効です。',
    );
    await expect(page.locator('#haori-version')).toContainText('loaded');

    const sampleInput = page.locator('#sample-input');
    await page.locator('#add-message').click();
    await expect(sampleInput).toHaveClass(/is-invalid/);
    await expect(page.locator('[data-haori-bootstrap-message-container="true"]')).toContainText(
      'CDN 版で入力内容を確認してください。',
    );

    await page.locator('#open-existing-dialog').click();
    const existingDialog = page.locator('#existing-dialog');
    await expect(existingDialog).toHaveClass(/show/);
    await page.locator('#close-inside-dialog').click();
    await expect(existingDialog).not.toHaveClass(/show/);
  });

  // CDN デモで公開 IIFE を読めない場合は失敗表示になること。
  test('shows an error state when the CDN bundle cannot be loaded', async ({ page }) => {
    await page.route(
      'https://cdn.jsdelivr.net/npm/haori-bootstrap@0.3.0/dist/haori-bootstrap.iife.js',
      async (route) => {
        await route.abort();
      },
    );

    await page.goto('/cdn.html');

    await expect(page.locator('#status')).toContainText(
      'CDN 読み込みに失敗しました。haori-bootstrap の公開 IIFE 読み込みと自動有効化を確認してください。',
    );
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