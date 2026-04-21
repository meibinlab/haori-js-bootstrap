# Haori.js Bootstrap

Haori.js Bootstrap is a Bootstrap-based UI extension library for Haori.js.

Version: 0.1.0

## Overview

- Official name: Haori.js Bootstrap
- Package identifier: haori-js-bootstrap
- Upstream Haori.js repository: https://github.com/meibinlab/haori-js
- Supported Bootstrap version: 5.3.x
- Distributed formats: ESM and IIFE

The library replaces Haori.js static UI methods such as dialog, confirm, toast, openDialog, closeDialog, addErrorMessage, and clearMessages with Bootstrap-based behavior while keeping existing Procedure integration intact.

## Installation

Install from npm:

```bash
npm install haori-js-bootstrap
```

This package expects Haori.js and Bootstrap CSS/JS to be available in the application.

## CDN Usage

Load dependencies in this order for browser direct loading:

1. Haori.js
2. Bootstrap CSS
3. bootstrap.bundle.js
4. haori-js-bootstrap

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
/>
<script src="https://cdn.jsdelivr.net/npm/haori@0.1.2/dist/haori.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/haori-js-bootstrap@0.1.0/dist/haori-js-bootstrap.iife.js"></script>
```

The IIFE build auto-enables when both window.Haori and window.bootstrap are available.

## ESM Usage

The ESM build also auto-enables on import when window.Haori and window.bootstrap are available.

```js
import 'haori-js-bootstrap';
```

When you need to override default options, call install explicitly.

```js
import { install } from 'haori-js-bootstrap';

install({
  fallbackToNative: true,
});
```

## Public API

| API | Purpose | Return value |
| ---- | ---- | ---- |
| dialog(message) | Informational dialog | Promise<void> |
| confirm(message) | Confirmation dialog | Promise<boolean> |
| toast(message, level) | Toast notification | Promise<void> |
| openDialog(element) | Open an arbitrary dialog element | Promise<void> |
| closeDialog(element) | Close an arbitrary dialog element | Promise<void> |
| addErrorMessage(target, message) | Append managed error messages | Promise<void> |
| clearMessages(parentOrTarget) | Remove only managed messages | Promise<void> |
| install(options) | Re-apply Bootstrap-backed Haori with overridden options | void |
| uninstall() | Restore the original Haori implementation | void |

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

Example next patch release after `0.1.0`:

```bash
# version becomes 0.1.1
npm version patch
git push origin main --follow-tags
```

Create and publish the GitHub Release for the pushed tag such as `0.1.1`.

Release automation:

- `npm version patch` also keeps the exported `version` constant in src/index.ts in sync.
- publish-on-release.yml builds the package and runs npm publish.
- release-archive.yml builds dist/ and uploads dist.zip to the same GitHub Release.

First release only:

- If the current version is not published yet, skip `npm version patch` and create/push the tag for that version directly.
- Create a granular npm access token with `Read and write` permission and register it as the repository secret `NPM_TOKEN`.
- If npm account 2FA is enabled, create the token with bypass 2FA for write actions.
- The package does not need to be published already to create `NPM_TOKEN`.

Example for the first `0.1.0` release:

```bash
git push origin main
git tag 0.1.0
git push origin 0.1.0
```

First release checklist:

1. Confirm the npm package name `haori-js-bootstrap` is still available.
2. Create and register `NPM_TOKEN` in GitHub repository secrets.
3. Run local verification and `npm pack --dry-run`.
4. Push the release tag.
5. Publish a GitHub Release from that tag.

## Documents

- Japanese README: [README.ja.md](README.ja.md)
- Initial design: [doc/Haori.js Bootstrap初期設計書.md](doc/Haori.js Bootstrap初期設計書.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)

## Notes

- Bootstrap CSS and JS are provided by the application side.
- Haori.js is treated as a prerequisite and is not bundled into this package.
- Browser direct loading for CDN consumers uses dist/haori-js-bootstrap.iife.js.
- The published npm entry is dist/haori-js-bootstrap.js with types at dist/index.d.ts.
