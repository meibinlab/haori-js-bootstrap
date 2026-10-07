import { expect, type Page, test } from '@playwright/test';

/**
 * スクリプトでボタンへ処理を登録するデモを開き、登録が終わるまで待つ。
 *
 * <p>デモのスクリプトは配布物を動的に読み込んでから処理を登録するため、ページの
 * 読み込みが終わった時点ではまだ押しても何も起きないことがある（公開中のデモで
 * 実際に落ちた）。`demo/demo-setup.js` の `markDemoReady()` が付ける印を待つ。
 *
 * @param page 対象ページ。
 * @param path 開くページのパス。
 * @return 完了時に解決される Promise。
 */
async function gotoScriptedDemo(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await page.locator('html[data-demo-ready="true"]').waitFor({ state: 'attached' });
}

test.describe('demo pages', () => {
  // 一覧ページから各デモへ遷移できること。
  test('navigates from index to each demo page', async ({ page }) => {
    await page.goto('./index.html');
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

    await page.goto('./index.html');
    await page.getByRole('link', { name: 'Procedure 連携デモを開く' }).click();
    await expect(page).toHaveURL(/\/procedure\.html$/);
    await expect(page.getByRole('heading', { name: 'Procedure 連携デモ' })).toBeVisible();

    await page.goto('./index.html');
    await choiceInputDemoLink.click();
    await expect(page).toHaveURL(/\/checkbox-radio\.html$/);
    await expect(page.getByRole('heading', { name: 'Checkbox / Radio Message Demo' })).toBeVisible();
    
    await page.goto('./index.html');
    await page.getByRole('link', { name: 'CDN デモを開く' }).click();
    await expect(page).toHaveURL(/\/cdn\.html$/);
    await expect(page.getByRole('heading', { name: 'CDN デモ' })).toBeVisible();
  });

  // Procedure 互換 demo で data-click-*-message の複数行 message が表示されること。
  test('executes the procedure compatibility demo interactions', async ({ page }) => {
    await gotoScriptedDemo(page, './procedure.html');

    await expect(page.locator('#procedure-status')).toContainText(
      'Procedure 互換の data-click-* モックが有効です。',
    );

    await page.getByRole('button', { name: 'data-click-dialog' }).click();
    const dialogModal = page.locator('[data-haori-dialog="true"]');
    await expect(dialogModal.locator('.modal-body p')).toContainText('1行目の案内です。');
    await expect(dialogModal.locator('.modal-body p')).toContainText('2行目の補足も表示されます。');
    await dialogModal.getByRole('button', { name: 'OK' }).click();
    await expect(page.locator('#procedure-status')).toContainText('data-click-dialog を実行しました。');

    await page.getByRole('button', { name: 'data-click-confirm' }).click();
    const confirmModal = page.locator('[data-haori-confirm="true"]');
    await expect(confirmModal.locator('.modal-body p')).toContainText('ユーザーを削除しますか。');
    await expect(confirmModal.locator('.modal-body p')).toContainText('この操作は元に戻せません。');
    await confirmModal.getByRole('button', { name: 'OK' }).click();
    await expect(page.locator('#procedure-status')).toContainText(
      'data-click-confirm は true を返しました。',
    );

    await page.getByRole('button', { name: 'data-click-toast' }).click();
    const toast = page.locator('[data-haori-toast="true"]').last();
    await expect(toast.locator('.toast-body')).toContainText('保存しました。');
    await expect(toast.locator('.toast-body')).toContainText('一覧を再読み込みしてください。');
    await expect(page.locator('#procedure-status')).toContainText('data-click-toast を実行しました。');
  });

  // 基本 API デモで dialog、confirm、toast、modal、メッセージ管理が動作すること。
  test('executes the core api demo interactions', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    await expect(page.locator('#status')).toContainText('BootstrapHaori が有効です。');

    await page.locator('#show-dialog').click();
    const dialogModal = page.locator('[data-haori-dialog="true"]');
    const dialogMessage = dialogModal.locator('.modal-body p');
    await expect(dialogMessage).toContainText('Haori.js Bootstrap の dialog サンプルです。');
    await expect(dialogMessage).toContainText('2行目も表示されます。');
    await expect(dialogMessage).toHaveCSS('white-space', 'pre-line');
    await dialogModal.getByRole('button', { name: 'OK' }).click();
    await expect(dialogModal).toHaveCount(0);

    await page.locator('#show-confirm').click();
    const confirmModal = page.locator('[data-haori-confirm="true"]');
    await expect(confirmModal).toContainText('confirm の挙動を確認しますか。');
    await expect(confirmModal.locator('.modal-body p')).toContainText('この操作はデモ用の表示確認です。');
    await confirmModal.getByRole('button', { name: 'OK' }).click();
    await expect(page.locator('#status')).toContainText('confirm は true を返しました。');

    await page.locator('#show-toast-info').click();
    const toastContainer = page.locator('[data-haori-toast-container="true"]');
    const toast = page.locator('[data-haori-toast="true"]').last();
    await expect(toastContainer).toHaveClass(/bottom-0/);
    await expect(toastContainer).toHaveClass(/end-0/);
    await expect(toast).toContainText('info の toast を表示しました。');
    await expect(toast.locator('.toast-body')).toContainText('2行目の通知です。');
    await expect(toast.locator('.toast-body')).toHaveCSS('white-space', 'pre-line');
    await expect(toast).toHaveClass(/bg-body/);
    await expect(toast).toHaveClass(/text-body/);
    await expect(toast.locator('[data-haori-toast-accent="true"]')).toHaveClass(/bg-info/);
    await expect(toast).toHaveAttribute('data-haori-toast-level', 'info');

    await page.locator('#show-toast-warning').click();
    const warningToast = page.locator('[data-haori-toast="true"]').last();
    await expect(warningToast.locator('.toast-body')).toContainText('warning の toast を表示しました。');
    await expect(warningToast.locator('.toast-body')).toContainText('確認が必要な通知です。');
    await expect(
      warningToast.locator('[data-haori-toast-accent="true"]'),
    ).toHaveClass(/bg-warning/);
    await expect(warningToast).toHaveAttribute('data-haori-toast-level', 'warning');

    await page.locator('#show-toast-error').click();
    const errorToast = page.locator('[data-haori-toast="true"]').last();
    await expect(errorToast.locator('.toast-body')).toContainText('error の toast を表示しました。');
    await expect(errorToast.locator('.toast-body')).toContainText('対応が必要な通知です。');
    await expect(errorToast.locator('[data-haori-toast-accent="true"]')).toHaveClass(/bg-danger/);
    await expect(errorToast).toHaveAttribute('data-haori-toast-level', 'error');

    await page.locator('#open-existing-dialog').click();
    const existingDialog = page.locator('#existing-dialog');
    await expect(existingDialog).toHaveClass(/show/);
    await page.locator('#close-inside-dialog').click();
    await expect(existingDialog).not.toHaveClass(/show/);

    const sampleInput = page.locator('#sample-input');
    await page.locator('#add-message').click();
    await expect(sampleInput).toHaveClass(/is-invalid/);
    await expect(page.locator('[data-haori-message-container="true"]')).toContainText(
      '入力内容を確認してください。',
    );

    await page.locator('#clear-message').click();
    await expect(sampleInput).not.toHaveClass(/is-invalid/);
    await expect(page.locator('[data-haori-message-container="true"]')).toHaveCount(0);
  });

  // CDN デモで公開済み配布物の読み込み成功と主要 UI 操作が確認できること。
  test('executes the published CDN demo interactions', async ({ page }) => {
    await page.goto('./cdn.html');

    await expect(page.locator('#status')).toContainText(
      'CDN 版 Haori.js Bootstrap 0.5.61 が有効です。',
    );
    // cdn.js は haori.version が文字列ならその版数を、なければ "loaded" を表示する。
    // コア haori が version を公開するかは配布物側の事情で変わるため、どちらでも読み込み成功と判定する。
    await expect(page.locator('#haori-version')).toHaveText(/loaded|\d+\.\d+\.\d+/);

    const sampleInput = page.locator('#sample-input');
    await page.locator('#add-message').click();
    await expect(sampleInput).toHaveClass(/is-invalid/);
    await expect(page.locator('[data-haori-message-container="true"]')).toContainText(
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
      'https://cdn.jsdelivr.net/npm/haori-bootstrap@0.5.61/dist/haori-bootstrap.iife.js',
      async (route) => {
        await route.abort();
      },
    );

    await page.goto('./cdn.html');

    await expect(page.locator('#status')).toContainText(
      'CDN 読み込みに失敗しました。haori-bootstrap の公開 IIFE 読み込みと自動有効化を確認してください。',
    );
  });

  // 行ボタンから共有モーダルを開き、data-click-copy で行スコープが
  // モーダルへ宣言的にコピーされること（および別行で再オープンしても
  // 前回値が残らず、タイミングよく最新行で再描画されること）を検証する。
  test('copies the row scope into the shared modal via data-click-copy', async ({
    page,
  }) => {
    await page.goto('./modal-copy.html');

    // コア haori の CDN 読み込み完了まで待つ（data-each の行描画完了が指標）。
    await expect(page.locator('tbody tr')).toHaveCount(3);

    const modal = page.locator('#acceptModal');
    const hiddenInput = modal.locator('input[name="appealId"]');

    // 2 行目（種別 content）の承認 → モーダルに AP-1002 と「復元」文言が反映される。
    await page
      .locator('tr', { hasText: 'AP-1002' })
      .getByRole('button', { name: '承認' })
      .click();
    await expect(modal).toHaveClass(/show/);
    await expect(modal.locator('.modal-body')).toContainText('AP-1002');
    await expect(modal.locator('.modal-body')).toContainText(
      'コンテンツを復元します。',
    );
    await expect(hiddenInput).toHaveValue('AP-1002');

    // 閉じてから 1 行目（種別 account）で再オープン → 前回値が残らず最新行に更新される。
    await modal.getByRole('button', { name: 'キャンセル' }).click();
    await expect(modal).not.toHaveClass(/show/);

    await page
      .locator('tr', { hasText: 'AP-1001' })
      .getByRole('button', { name: '承認' })
      .click();
    await expect(modal).toHaveClass(/show/);
    await expect(modal.locator('.modal-body')).toContainText('AP-1001');
    await expect(modal.locator('.modal-body')).toContainText(
      '利用停止を解除します。',
    );
    await expect(hiddenInput).toHaveValue('AP-1001');
  });

  // confirm でキャンセルボタンを押すと false が返ること。
  test('confirm resolves with false when the Cancel button is clicked', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    await page.locator('#show-confirm').click();
    const confirmModal = page.locator('[data-haori-confirm="true"]');
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.locator('#status')).toContainText('confirm は false を返しました。');
    await expect(confirmModal).toHaveCount(0);
  });

  // フェードイン中に OK を押しても confirm が閉じ、呼び出し元の手続きが進むこと（報告 AI の回帰）。
  // Bootstrap は表示アニメーション中の hide() を無視するため、修正前はここで確認が
  // 開いたまま残り、`#status` が更新されなかった。dispatchEvent は要素が DOM へ付いた
  // ことだけを待つため（可視性・静止を待たない）、フェードインの最中に押下できる。
  test('confirm resolves when ok is clicked while the modal is fading in', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    await page.locator('#show-confirm').click();
    const confirmModal = page.locator('[data-haori-confirm="true"]');
    // アニメーションする構成（`fade`）であることだけを確かめ、表示完了は待たない。
    await expect(confirmModal).toHaveClass(/fade/);
    await confirmModal.locator('[data-haori-confirm-ok="true"]').dispatchEvent('click');

    await expect(page.locator('#status')).toContainText('confirm は true を返しました。');
    await expect(confirmModal).toHaveCount(0);
  });

  // backdrop=static ではバックドロップクリックおよび Esc でダイアログが閉じないこと。
  test('dialog with backdrop=static stays open on backdrop click and Esc', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    await page.locator('#show-dialog').click();
    const dialogModal = page.locator('[data-haori-dialog="true"]');
    await expect(dialogModal).toBeVisible();

    // Click backdrop area: top-left corner of the full-viewport modal overlay,
    // well outside the centered dialog content.
    await page.mouse.click(5, 5);
    await expect(dialogModal).toBeVisible();

    // Esc key is also suppressed by Bootstrap when backdrop=static.
    await page.keyboard.press('Escape');
    await expect(dialogModal).toBeVisible();

    await dialogModal.getByRole('button', { name: 'OK' }).click();
    await expect(dialogModal).toHaveCount(0);
  });

  // closeDialog がモーダル外部からの呼び出しでも既存ダイアログを閉じられること。
  test('closeDialog closes an existing dialog via an external button', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    await page.locator('#open-existing-dialog').click();
    const existingDialog = page.locator('#existing-dialog');
    await expect(existingDialog).toHaveClass(/show/);
    // Bootstrap's hide() is ignored while _isTransitioning is true (fade-in animation ~300ms).
    await page.waitForFunction(() => {
      const el = document.querySelector('#existing-dialog');
      // Bootstrap の内部状態 _isTransitioning を参照するため最小型でアクセスする。
      const w = window as unknown as {
        bootstrap?: {
          Modal?: {
            getInstance?: (
              element: Element | null,
            ) => { _isTransitioning?: boolean } | null;
          };
        };
      };
      const instance = w.bootstrap?.Modal?.getInstance?.(el);
      return Boolean(instance && !instance._isTransitioning);
    });

    // Modal overlay blocks pointer events on background elements; use dispatchEvent to bypass.
    await page.locator('#close-existing-dialog').dispatchEvent('click');
    await expect(existingDialog).not.toHaveClass(/show/);
  });

  // Procedure 連携デモで confirm Cancel が false を返すこと。
  test('procedure confirm resolves false when Cancel is clicked', async ({ page }) => {
    await gotoScriptedDemo(page, './procedure.html');

    await page.getByRole('button', { name: 'data-click-confirm' }).click();
    const confirmModal = page.locator('[data-haori-confirm="true"]');
    await expect(confirmModal).toBeVisible();

    await confirmModal.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.locator('#procedure-status')).toContainText(
      'data-click-confirm は false を返しました。',
    );
    await expect(confirmModal).toHaveCount(0);
  });

  // checkbox と radio のデモで専用メッセージ配置とクリアが動作すること。
  test('shows and clears choice-input messages in the dedicated demo', async ({ page }) => {
    await gotoScriptedDemo(page, './checkbox-radio.html');

    await page.getByRole('button', { name: 'エラー表示' }).first().click();
    const checkboxWrapper = page.locator('#checkbox-wrapper');
    await expect(
      checkboxWrapper.locator('[data-haori-message-container="true"]'),
    ).toContainText('利用規約への同意が必要です。');
    await expect(page.locator('#terms-checkbox')).toHaveClass(/is-invalid/);

    await page.getByRole('button', { name: 'クリア' }).first().click();
    await expect(
      checkboxWrapper.locator('[data-haori-message-container="true"]'),
    ).toHaveCount(0);
    await expect(page.locator('#terms-checkbox')).not.toHaveClass(/is-invalid/);

    await page.getByRole('button', { name: 'エラー表示' }).nth(1).click();
    const radioGroup = page.locator('#radio-group');
    await expect(
      radioGroup.locator('[data-haori-message-container="true"]'),
    ).toContainText('いずれかの選択肢を選んでください。');
    await expect(page.locator('#sample-radio-a')).toHaveClass(/is-invalid/);
    await expect(page.locator('#sample-radio-b')).toHaveClass(/is-invalid/);

    await page.getByRole('button', { name: 'クリア' }).nth(1).click();
    await expect(
      radioGroup.locator('[data-haori-message-container="true"]'),
    ).toHaveCount(0);
    await expect(page.locator('#sample-radio-a')).not.toHaveClass(/is-invalid/);
    await expect(page.locator('#sample-radio-b')).not.toHaveClass(/is-invalid/);
  });

  // success レベルの toast が bg-success のアクセント帯で表示されること。
  test('shows a success toast with bg-success accent', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    await page.locator('#show-toast-success').click();
    const toast = page.locator('[data-haori-toast="true"]').last();
    await expect(toast.locator('.toast-body')).toContainText('success の toast を表示しました。');
    await expect(toast.locator('.toast-body')).toContainText('処理が完了しました。');
    await expect(toast.locator('[data-haori-toast-accent="true"]')).toHaveClass(/bg-success/);
    await expect(toast).toHaveAttribute('data-haori-toast-level', 'success');
  });

  // toastDelay を指定すると toast が指定時間後に自動で消えること。
  test('toast disappears automatically after toastDelay ms', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    await page.locator('#show-toast-short-delay').click();
    const toast = page.locator('[data-haori-toast="true"]').last();
    await expect(toast).toBeVisible();

    // 500ms の delay + Bootstrap のフェードアウトアニメーション (~300ms) を考慮して 2000ms 以内に消えること。
    await expect(toast).not.toBeVisible({ timeout: 2000 });
  });

  // toast に dismiss ボタンが表示されること。
  test('shows a dismiss button in the toast', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    await page.locator('#show-toast-info').click();
    const toast = page.locator('[data-haori-toast="true"]').last();
    const dismissButton = toast.locator('[data-haori-toast-dismiss="true"]');

    await expect(dismissButton).toBeVisible();
    await expect(dismissButton).toHaveAttribute('aria-label', 'Close');
  });

  // dismiss ボタンをクリックすると toast が消えること。
  test('closes the toast when the dismiss button is clicked', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    await page.locator('#show-toast-info').click();
    const toast = page.locator('[data-haori-toast="true"]').last();
    await expect(toast).toBeVisible();

    await toast.locator('[data-haori-toast-dismiss="true"]').click();
    await expect(toast).not.toBeVisible({ timeout: 2000 });
  });

  // addMessage success で is-valid と valid-feedback が付くこと。
  test('addMessage success applies is-valid and valid-feedback', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    const sampleInput = page.locator('#sample-input');
    await page.locator('#add-message-success').click();
    await expect(sampleInput).toHaveClass(/is-valid/);
    await expect(sampleInput).not.toHaveClass(/is-invalid/);
    await expect(page.locator('[data-haori-message-container="true"]')).toContainText(
      '入力内容は正しいです。',
    );
    await expect(page.locator('[data-haori-message-container="true"]')).toHaveClass(
      /valid-feedback/,
    );
  });

  // addMessage warning で is-valid が付かず valid-feedback も付かないこと。
  test('addMessage warning does not apply is-valid or is-invalid', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    const sampleInput = page.locator('#sample-input');
    await page.locator('#add-message-warning').click();
    await expect(sampleInput).not.toHaveClass(/is-valid/);
    await expect(sampleInput).not.toHaveClass(/is-invalid/);
    await expect(page.locator('[data-haori-message-container="true"]')).toContainText(
      '注意: 入力内容を確認してください。',
    );
  });

  // addMessage info で is-valid が付かず valid-feedback も付かないこと。
  test('addMessage info does not apply is-valid or is-invalid', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    const sampleInput = page.locator('#sample-input');
    await page.locator('#add-message-info').click();
    await expect(sampleInput).not.toHaveClass(/is-valid/);
    await expect(sampleInput).not.toHaveClass(/is-invalid/);
    await expect(page.locator('[data-haori-message-container="true"]')).toContainText(
      '情報: 入力フォームです。',
    );
  });

  // success → warning に切り替えると is-valid が解除されること。
  test('addMessage success then warning clears is-valid', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    const sampleInput = page.locator('#sample-input');
    await page.locator('#add-message-success').click();
    await expect(sampleInput).toHaveClass(/is-valid/);

    await page.locator('#add-message-warning').click();
    await expect(sampleInput).not.toHaveClass(/is-valid/);
    await expect(sampleInput).not.toHaveClass(/is-invalid/);
  });

  // success → error に切り替えると is-valid が解除され is-invalid が付くこと。
  test('addMessage success then error clears is-valid and applies is-invalid', async ({ page }) => {
    await gotoScriptedDemo(page, './api.html');

    const sampleInput = page.locator('#sample-input');
    await page.locator('#add-message-success').click();
    await expect(sampleInput).toHaveClass(/is-valid/);

    await page.locator('#add-message-error').click();
    await expect(sampleInput).not.toHaveClass(/is-valid/);
    await expect(sampleInput).toHaveClass(/is-invalid/);
  });

  // 一覧デモが静的な JSON を取得して行を描画し、最後のページまで読み込めること。
  // 公開構成（playwright.pages.config.ts）では、JSON がビルドに含まれていることを確かめる。
  test('loads every page of the admin table from the static JSON files', async ({ page }) => {
    await page.goto('./admin-table.html');
    await expect(page.locator('tbody')).toContainText('USER-0001');

    const scroller = page.locator('.table-scroll');
    const completed = page.getByText('すべて表示しました');
    await expect
      .poll(async () => {
        await scroller.evaluate((element) => {
          element.scrollTop = element.scrollHeight;
        });
        return completed.isVisible();
      })
      .toBe(true);
  });

  // 宣言だけ（install() を呼ばず）でボタン文言が日本語になること（要望 AM）。
  // OK は <script> タグの属性、キャンセルは <html> の属性で設定している。
  test('applies the declared dialog button labels without any page script', async ({ page }) => {
    await page.goto('./dialog-label.html');

    await page.locator('#ask').click();
    const confirmModal = page.locator('[data-haori-confirm="true"]');
    await expect(confirmModal).toContainText('この操作を実行しますか。');

    const okButton = confirmModal.locator('[data-haori-confirm-ok="true"]');
    const cancelButton = confirmModal.locator('[data-haori-confirm-cancel="true"]');
    await expect(okButton).toHaveText('OK');
    await expect(cancelButton).toHaveText('キャンセル');

    // 識別属性は文言に関わらず変わらないため、そのまま操作できる。
    await okButton.click();
    await expect(page.locator('[data-haori-dialog="true"]')).toContainText('実行しました。');
  });

  /**
   * 閉じる操作のロックのデモで、ダイアログを開いて表示の完了まで待つ。
   *
   * @param page 対象ページ。
   * @param openSelector 開くボタンのセレクタ。
   * @param modalSelector 開く `.modal` のセレクタ。
   * @return 完了時に解決される Promise。
   */
  async function openLockDemoDialog(
    page: Page,
    openSelector = '#open-lock-dialog',
    modalSelector = '#lock-dialog',
  ): Promise<void> {
    await page.goto('./dismiss-lock.html');
    await page.locator(openSelector).click();
    await expect(page.locator(modalSelector)).toHaveClass(/show/);
    // フェードイン中の hide() は Bootstrap が無視するため、閉じないことの確認が空振りする。
    await page.waitForFunction((selector) => {
      const element = document.querySelector(selector);
      // Bootstrap の内部状態 _isTransitioning を参照するため最小型でアクセスする。
      const w = window as unknown as {
        bootstrap?: {
          Modal?: {
            getInstance?: (target: Element | null) => { _isTransitioning?: boolean } | null;
          };
        };
      };
      const instance = w.bootstrap?.Modal?.getInstance?.(element);
      return Boolean(instance && !instance._isTransitioning);
    }, modalSelector);
  }

  /**
   * 取得の応答を、返してよいと指示するまで止める。
   *
   * @param page 対象ページ。
   * @param status 返すステータス。
   * @return 応答を返す関数。
   */
  async function holdLockFetch(page: Page, status: number): Promise<() => void> {
    let release: () => void = () => undefined;
    const released = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/data/dismiss-lock.json', async (route) => {
      await released;
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: status === 200 ? '{"reward": {"id": 1}}' : '{}',
      });
    });
    return release;
  }

  /** 取得中に試す閉じる操作。Bootstrap 本体はいずれも hide() を呼ぶ。 */
  const lockedDismissals: { name: string; dismiss: (page: Page) => Promise<void> }[] = [
    {
      name: 'Escape',
      dismiss: async (page) => {
        // 押したボタンは取得中に disabled になり、フォーカスが Modal の外へ出る。Bootstrap は
        // Modal 上の keydown だけで Esc キーを処理するため、Modal へフォーカスを戻して押す。
        await page.locator('#lock-dialog').focus();
        await page.keyboard.press('Escape');
      },
    },
    {
      name: 'backdrop click',
      dismiss: async (page) => {
        // 画面の左上は、中央のダイアログの外（背景）にあたる。
        await page.mouse.click(5, 5);
      },
    },
    {
      name: 'data-bs-dismiss',
      dismiss: async (page) => {
        await page.locator('#lock-dismiss').click();
      },
    },
  ];

  for (const { name, dismiss } of lockedDismissals) {
    // 取得中は閉じる操作で閉じず、失敗したときは data-click-error-close で閉じること（要望 BV）。
    test(`keeps a locked modal open against ${name} and closes it on error-close`, async ({
      page,
    }) => {
      await openLockDemoDialog(page);
      const release = await holdLockFetch(page, 404);
      const modal = page.locator('#lock-dialog');

      await page.locator('#lock-fetch').click();
      await expect(modal).toHaveAttribute('data-haori-dismiss-lock', 'true');

      await dismiss(page);
      // Bootstrap は閉じ始めに show をその場で外す。止まっていれば付いたままになる。
      await expect(modal).toHaveClass(/show/);

      release();
      await expect(modal).toBeHidden();
    });
  }

  // 取得を終えてロックが外れた後は、Esc キーで閉じること（要望 BV）。
  test('closes the modal with Escape once the fetch has finished', async ({ page }) => {
    await openLockDemoDialog(page);
    const release = await holdLockFetch(page, 200);
    const modal = page.locator('#lock-dialog');

    await page.locator('#lock-fetch').click();
    await expect(modal).toHaveAttribute('data-haori-dismiss-lock', 'true');
    release();
    await expect(modal).not.toHaveAttribute('data-haori-dismiss-lock');

    // 押したボタンが取得中に disabled になってフォーカスが外れるため、Modal へ戻して押す。
    await modal.focus();
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  // data-on-target を足した hidden.bs.modal の手続きは、指定したモーダルが閉じたときだけ
  // 走ること（要望 BW）。
  test('runs a hidden.bs.modal procedure only for the modal named by data-on-target', async ({
    page,
  }) => {
    const count = page.locator('#lock-closed-count');
    await openLockDemoDialog(page);
    await expect(count).toHaveText('0');

    await page.locator('#lock-dialog').focus();
    await page.keyboard.press('Escape');
    await expect(page.locator('#lock-dialog')).toBeHidden();
    await expect(count).toHaveText('1');

    await page.locator('#open-always-lock-dialog').click();
    await expect(page.locator('#always-lock-dialog')).toHaveClass(/show/);
    await page.locator('#always-lock-close').click();
    await expect(page.locator('#always-lock-dialog')).toBeHidden();
    await expect(count).toHaveText('1');
  });

  // 値を書かずに宣言したダイアログは、Esc キーで閉じず、data-click-close で閉じること（要望 BV）。
  test('closes an always-locked modal only by data-click-close', async ({ page }) => {
    await openLockDemoDialog(page, '#open-always-lock-dialog', '#always-lock-dialog');
    const modal = page.locator('#always-lock-dialog');

    await modal.focus();
    await page.keyboard.press('Escape');
    await expect(modal).toHaveClass(/show/);

    await page.locator('#always-lock-close').click();
    await expect(modal).toBeHidden();
  });

  // フォームの外のボタンの取得が失敗したとき、全体エラーの枠をボタンの中ではなく直後に置くこと。
  test('places the error alert after a button outside a form', async ({ page }) => {
    // コアは、フォームが無いとボタン自身を表示先として渡す。実物のコアと組み合わせて確かめるため、
    // デモと同じ配布物を読む検証用のページを返す。
    await page.route('**/zz-button-error.html', async (route) => {
      await route.fulfill({
        contentType: 'text/html; charset=utf-8',
        body:
          '<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>検証</title>' +
          '</head><body><div id="row">' +
          '<button id="export" type="button" class="btn btn-primary"' +
          ' data-click-fetch="./data/zz-export.csv" data-click-fetch-download>CSVエクスポート</button>' +
          '</div>' +
          '<script src="https://cdn.jsdelivr.net/npm/haori@0.59.3/dist/haori.iife.js"></script>' +
          '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>' +
          '<script src="./haori-bootstrap.iife.js"></script>' +
          '</body></html>',
      });
    });
    await page.route('**/data/zz-export.csv', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: '[{"key":"","message":"出力できませんでした"}]',
      });
    });

    await page.goto('./zz-button-error.html');
    await page.locator('#export').click();

    const alert = page.locator('#export + [data-haori-message-container="true"]');
    await expect(alert).toHaveText('出力できませんでした');
    await expect(alert).toHaveClass(/alert-danger/);
    await expect(page.locator('#export [data-haori-message-container]')).toHaveCount(0);
    await expect(page.locator('#export')).toHaveText('CSVエクスポート');
  });

  test.describe('nested modal focus', () => {
    // 開き終わったモーダルと、閉じ始めたモーダルの id を順に記録する。入れ子の確かめに使う。
    const nestedPage = (body: string) =>
      '<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>検証</title>' +
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css">' +
      '</head><body>' +
      body +
      '<script>window.shownModals = []; window.hidingModals = [];' +
      "document.addEventListener('shown.bs.modal', (e) => window.shownModals.push(e.target.id || 'dialog'));" +
      "document.addEventListener('hide.bs.modal', (e) => window.hidingModals.push(e.target.id || 'dialog'));" +
      '</script>' +
      '<script src="https://cdn.jsdelivr.net/npm/haori@0.59.3/dist/haori.iife.js"></script>' +
      '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>' +
      '<script src="./haori-bootstrap.iife.js"></script>' +
      '</body></html>';

    const parentModal = (inner: string) =>
      '<button id="open-parent" type="button" data-click-open="#parent">親を開く</button>' +
      '<div class="modal fade" id="parent" tabindex="-1"><div class="modal-dialog"><div class="modal-content">' +
      '<div class="modal-header"><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>' +
      '<div class="modal-body">' +
      inner +
      '</div></div></div></div>';

    const waitForShown = (page: Page, count: number) =>
      page.waitForFunction((n) => (window as unknown as { shownModals: string[] }).shownModals.length === n, count);

    // README「入れ子のモーダルのフォーカス」の「フォーカスを子へ移し、子が閉じたら親へ戻します」と、
    // 「子を開く直前に親の中でフォーカスがあった要素（子を開いたボタンなど）へ戻します」。
    test('moves focus to the child and back so Escape closes them in order', async ({ page }) => {
      await page.route('**/zz-nested-modal.html', async (route) => {
        await route.fulfill({
          contentType: 'text/html; charset=utf-8',
          body: nestedPage(
            parentModal('<button id="open-child" type="button" data-click-open="#child">子を開く</button>') +
              '<div class="modal fade" id="child" tabindex="-1"><div class="modal-dialog"><div class="modal-content">' +
              '<div class="modal-body">子</div></div></div></div>',
          ),
        });
      });

      await page.goto('./zz-nested-modal.html');
      await page.locator('#open-parent').click();
      await waitForShown(page, 1);
      await page.locator('#open-child').click();
      await waitForShown(page, 2);

      expect(await page.evaluate(() => document.getElementById('child')!.contains(document.activeElement))).toBe(true);

      await page.keyboard.press('Escape');
      await expect(page.locator('#child')).toBeHidden();
      await expect(page.locator('#parent')).toBeVisible();
      await expect(page.locator('#open-child')).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(page.locator('#parent')).toBeHidden();
    });

    // README「入れ子のモーダルのフォーカス」の「子が閉じた後、他のモーダルがまだ開いていれば、
    // その中でいちばん手前のモーダルに Tab キーのフォーカスを閉じ込めます。」と、
    // 「他のモーダルがまだ開いていれば付け直します」。
    test('keeps Tab focus inside the parent after the child is closed', async ({ page }) => {
      await page.route('**/zz-nested-trap.html', async (route) => {
        await route.fulfill({
          contentType: 'text/html; charset=utf-8',
          body: nestedPage(
            '<a id="outside" href="#">外</a>' +
              parentModal(
                '<input id="first-input"><button id="open-child" type="button" data-click-open="#child">子を開く</button>',
              ) +
              '<div class="modal fade" id="child" tabindex="-1"><div class="modal-dialog"><div class="modal-content">' +
              '<div class="modal-body">子</div></div></div></div>',
          ),
        });
      });

      await page.goto('./zz-nested-trap.html');
      await page.locator('#open-parent').click();
      await waitForShown(page, 1);
      await page.locator('#open-child').click();
      await waitForShown(page, 2);
      await page.keyboard.press('Escape');
      await expect(page.locator('#child')).toBeHidden();
      await expect(page.locator('#open-child')).toBeFocused();

      // Tab キーで移った先を順に集める。最後の要素から先は、ブラウザーの外（`BODY`）を経て
      // 文書の先頭へ戻り、閉じ込めで親の中へ戻る。親だけを開いたとき（Bootstrap 自身が
      // 閉じ込める）と同じ順になることを確かめる。
      const keys = ['Tab', 'Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab'];
      const walk = async () => {
        const seen: string[] = [];
        for (const key of keys) {
          await page.keyboard.press(key);
          seen.push(await page.evaluate(() => document.activeElement!.id || document.activeElement!.tagName));
        }
        return seen;
      };
      const afterChild = await walk();
      await expect(page.locator('body')).toHaveClass(/modal-open/);
      expect(afterChild).not.toContain('outside');

      await page.evaluate(() => {
        const bs = (window as unknown as { bootstrap: { Modal: { getInstance: (e: Element) => { hide: () => void } } } })
          .bootstrap;
        bs.Modal.getInstance(document.getElementById('parent')!).hide();
      });
      await expect(page.locator('#parent')).toBeHidden();
      await page.locator('#open-parent').click();
      await waitForShown(page, 3);
      await page.locator('#open-child').focus();
      expect(afterChild).toEqual(await walk());
    });

    // README「入れ子のモーダルのフォーカス」の「Haori の確認ダイアログを親の中から開くと、
    // Enter キーで後ろにある親のボタンが押されます」を防ぐ。
    test('keeps Enter on a confirm dialog from pressing a button of the parent', async ({ page }) => {
      await page.route('**/zz-nested-confirm.html', async (route) => {
        await route.fulfill({
          contentType: 'text/html; charset=utf-8',
          body: nestedPage(
            parentModal(
              '<button id="ask" type="button" data-click-confirm="よろしいですか？" data-click-toast="はい">確認</button>',
            ),
          ),
        });
      });

      await page.goto('./zz-nested-confirm.html');
      await page.locator('#open-parent').click();
      await waitForShown(page, 1);
      await page.locator('#ask').click();
      await waitForShown(page, 2);

      expect(
        await page.evaluate(() => document.querySelector('[data-haori-confirm]')!.contains(document.activeElement)),
      ).toBe(true);

      // Enter キーによるボタンの押下と Bootstrap の hide.bs.modal は同期で起きる。
      await page.keyboard.press('Enter');
      expect(await page.evaluate(() => (window as unknown as { hidingModals: string[] }).hidingModals)).toEqual([]);
      await expect(page.locator('#parent')).toBeVisible();
      await expect(page.locator('[data-haori-confirm]')).toBeVisible();
    });
  });
});