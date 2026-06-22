# Haori.js Bootstrap

Haori.js Bootstrap is a Bootstrap-based UI extension library for Haori.js.

Version: 0.5.5

## Overview

- Official name: Haori.js Bootstrap
- Package identifier: haori-bootstrap
- Upstream Haori.js repository: https://github.com/meibinlab/haori-js
- GitHub repository: https://github.com/meibinlab/haori-js-bootstrap
- Supported Bootstrap version: 5.3.x
- Distributed formats: ESM and IIFE

The npm package has been renamed from `haori-js-bootstrap` to `haori-bootstrap`, and the previous package is now deprecated. Existing installations should migrate to the new package name. The GitHub repository name remains unchanged.

The library replaces Haori.js static UI methods such as dialog, confirm, toast, openDialog, closeDialog, addErrorMessage, and clearMessages with Bootstrap-based behavior while keeping existing Procedure integration intact.

## Installation

Install from npm:

```bash
npm install haori-bootstrap
```

This package expects Haori.js and Bootstrap CSS/JS to be available in the application.

## CDN Usage

Load dependencies in this order for browser direct loading:

1. Haori.js
2. Bootstrap CSS
3. bootstrap.bundle.js
4. haori-bootstrap

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
/>
<script src="https://cdn.jsdelivr.net/npm/haori@0.22.1/dist/haori.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/haori-bootstrap@0.5.5/dist/haori-bootstrap.iife.js"></script>
```

The IIFE build auto-enables when both window.Haori and window.bootstrap are available.

## ESM Usage

The ESM build also auto-enables on import when window.Haori and window.bootstrap are available.

```js
import 'haori-bootstrap';
```

When you need to override default options, call install explicitly.

```js
import { install } from 'haori-bootstrap';

install({
  fallbackToNative: true,
  runtime: 'demo',
});
```

## Public API

| API | Purpose | Return value |
| ---- | ---- | ---- |
| dialog(message) | Informational dialog | Promise<void> |
| confirm(message) | Confirmation dialog | Promise<boolean> |
| toast(message, level) | Toast notification | Promise<void> |
| openDialog(element) | Open the target's modal (pass the `.modal` itself or a descendant; a non-`.modal` element resolves to its nearest ancestor `.modal`). Managed messages and `is-invalid` / `is-valid` state under the modal are cleared before it is shown, so a reopened form starts clean. | Promise<void> |
| closeDialog(element) | Close the target's modal (pass the `.modal` itself or a descendant; a non-`.modal` element resolves to its nearest ancestor `.modal`) | Promise<void> |
| addErrorMessage(target, message) | Append managed error messages | Promise<void> |
| addMessage(target, message, level?) | Append a level-aware managed message (`'error'` \| `'success'` \| `'warning'` \| `'info'`). Switches Bootstrap validation classes (`is-invalid` / `is-valid`) on re-call. | Promise<void> |
| clearMessages(parentOrTarget) | Remove only managed messages | Promise<void> |
| install(options) | Re-apply Bootstrap-backed Haori with overridden options, including runtime | void |
| uninstall() | Restore the original Haori implementation | void |

### install options

| Option | Type | Default | Description |
| ---- | ---- | ---- | ---- |
| toastPosition | `'top-start' \| 'top-center' \| 'top-end' \| 'bottom-start' \| 'bottom-center' \| 'bottom-end'` | `'bottom-end'` | Toast container position. The new position takes effect the next time a toast is shown. |
| toastDelay | `number` | Bootstrap default (5000ms) | Auto-hide delay in milliseconds for toast notifications. |

## Procedure Integration Example

Existing Procedure flows can keep using data-click-* and data-click-*-message attributes.

```html
<button
  type="button"
  data-click-confirm="deleteUser"
  data-click-confirm-message="Delete this user?\nThis action cannot be undone."
>
  Delete
</button>

<button
  type="button"
  data-click-toast="notifySaved"
  data-click-toast-message="Saved successfully.\nPlease refresh the list."
>
  Show saved toast
</button>
```

- Messages are rendered as plain text, not HTML.
- Literal `\n` sequences are normalized to line breaks for dialog, confirm, and toast.
- Haori.js and Procedure remain responsible for interpreting data-click-* attributes and dispatching static method calls.

## Persisting collapse state

Add `data-haori-persist="key"` to a Bootstrap collapse element to persist its open/closed state in `sessionStorage` and restore it on the next visit.

```html
<button data-bs-toggle="collapse" data-bs-target="#sideMenu">Menu</button>
<div class="collapse" id="sideMenu" data-haori-persist="side-menu">
  ...
</div>
```

- Listens to `shown.bs.collapse` / `hidden.bs.collapse` and stores `shown` / `hidden`.
- `install()` restores existing elements and applies restoration to fragments inserted later (e.g. via `data-import`) through a `MutationObserver`.
- On restore it also syncs the associated toggles (`data-bs-toggle="collapse"` whose `data-bs-target` / `href` points to the collapse) — their `aria-expanded` and `collapsed` class. Toggle syncing requires the collapse element to have an `id`.
- State is keyed by the attribute value; reusing a key across elements shares their state.
- When storage is unavailable (e.g. private mode) the feature silently disables itself and never throws.
- `uninstall()` removes the listeners and observer.

## Passing row context to a shared modal

When you open a single shared Bootstrap modal from per-row buttons (inside `data-each`) and need the row's context (e.g. a target id or type) inside the modal, use Haori core's declarative `data-{event}-copy`. No hand-written `show.bs.modal` listener or per-row modal duplication is required.

`data-{event}-copy` copies binding values into the target element's scope and runs independently of `data-{event}-fetch`. When `data-{event}-form` is absent, the copy source is the trigger element's own / inherited binding data — i.e. the current row scope. `data-{event}-copy-params` selects which keys to forward (`&`-separated; a leading `!` excludes), and existing keys on the target are preserved while same-named keys are overwritten.

```html
<!-- Row button (inside data-each): open the shared modal and copy the row scope -->
<button
  data-bs-toggle="modal"
  data-bs-target="#acceptModal"
  data-click-copy="#acceptModal"
  data-click-copy-params="appealId&targetType"
>
  Approve
</button>

<!-- Shared modal: give it data-bind to make it a scope root, then reference copied values -->
<div class="modal" id="acceptModal" data-bind="{}">
  <input type="hidden" name="appealId" data-attr-value="{{appealId}}" />
  <p>{{ targetType == 'account' ? 'Lift the suspension.' : 'Restore the content.' }}</p>
</div>
```

- `data-{event}-copy` / `-copy-params` / `-copy-source` are Haori **core** features (not specific to this package); see the haori-js documentation for full semantics.
- Give the shared modal a `data-bind` (an empty `{}` is fine) so it acts as a binding scope root the copied values merge into.
- Wording can be branched on the copied keys directly in the modal via `{{ ... }}`, so renaming/computing keys is usually unnecessary.
- See `demo/modal-copy.html` for a working example.

## Stable selectors for e2e

The elements rendered by `dialog` / `confirm` / `toast` carry stable identifier attributes that do not depend on wording or locale. In e2e tests (e.g. Playwright), prefer building selectors from these attributes instead of visible text or button names — they survive copy changes and localization.

| Element | Attribute | Value |
| ---- | ---- | ---- |
| Toast root | `data-haori-toast` | `"true"` |
| Toast level | `data-haori-toast-level` | `"success"` \| `"warning"` \| `"error"` \| `"info"` |
| Toast dismiss button | `data-haori-toast-dismiss` | `"true"` |
| Toast container | `data-haori-toast-container` | `"true"` |
| Info dialog root | `data-haori-dialog` | `"true"` |
| Info dialog OK button | `data-haori-dialog-ok` | `"true"` |
| Confirm dialog root | `data-haori-confirm` | `"true"` |
| Confirm dialog OK button | `data-haori-confirm-ok` | `"true"` |
| Confirm dialog cancel button | `data-haori-confirm-cancel` | `"true"` |
| Dialog title | `data-haori-dialog-title` | `"true"` |
| Managed message container | `data-haori-message-container` | `"true"` |

```ts
// Operate the confirm dialog without depending on wording
await page.locator('[data-haori-confirm-ok="true"]').click();

// Assert the toast level
await expect(page.locator('[data-haori-toast="true"]').last())
  .toHaveAttribute('data-haori-toast-level', 'success');
```

> These attributes are maintained as a stable public contract. Info dialogs (`data-haori-dialog`) and confirm dialogs (`data-haori-confirm`) are distinguished by their root attribute.

## Build & Publish

Local verification:

```bash
npm install
npm run compile
npm run test
npm run build
npm pack --dry-run
```

Regular release flow:

```bash
npm version patch
git push origin main --follow-tags
```

After pushing, publish a GitHub Release from the generated version tag. The release workflow then publishes the package and uploads `dist.zip` automatically.

Example next patch release after `0.5.5`:

```bash
# version becomes 0.5.6
npm version patch
git push origin main --follow-tags
```

Create and publish the GitHub Release for the pushed tag such as `0.5.6`.

Release automation:

- `npm version patch` also keeps the exported `version` constant, README examples, CDN demo, and Playwright CDN checks in sync.
- publish-on-release.yml builds the package and runs npm publish.
- release-archive.yml builds dist/ and uploads dist.zip to the same GitHub Release.

First release only:

- If the current version is not published yet, skip `npm version patch` and create/push the tag for that version directly.
- Create a granular npm access token with `Read and write` permission and register it as the repository secret `NPM_TOKEN`.
- If npm account 2FA is enabled, create the token with bypass 2FA for write actions.
- The package does not need to be published already to create `NPM_TOKEN`.

Example for the first `0.3.1` release after the package rename:

```bash
git push origin main
git tag 0.3.1
git push origin 0.3.1
```

First release checklist:

1. Confirm the npm package name `haori-bootstrap` is still available.
2. Create and register `NPM_TOKEN` in GitHub repository secrets.
3. Run local verification and `npm pack --dry-run`.
4. Push the release tag.
5. Publish a GitHub Release from that tag.

## Documents

- Japanese README: [README.ja.md](README.ja.md)
- Initial design: [doc/Haori.js Bootstrap初期設計書.md](doc/Haori.js Bootstrap初期設計書.md)
- Browser demo procedure proposal: [doc/ブラウザデモ時Procedure挙動仕様提案.md](doc/%E3%83%96%E3%83%A9%E3%82%A6%E3%82%B6%E3%83%87%E3%83%A2%E6%99%82Procedure%E6%8C%99%E5%8B%95%E4%BB%95%E6%A7%98%E6%8F%90%E6%A1%88.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)

## Notes

- Bootstrap CSS and JS are provided by the application side.
- Haori.js is treated as a prerequisite and is not bundled into this package.
- Browser direct loading for CDN consumers uses dist/haori-bootstrap.iife.js.
- The published npm entry is dist/haori-bootstrap.js with types at dist/index.d.ts.
- Browser demo transport normalization is discussed in the proposal document above and is not part of the current public API.
