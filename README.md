# Haori.js Bootstrap

Haori.js Bootstrap is a Bootstrap-based UI extension library for Haori.js.

This repository currently contains the initial design and documentation for the library. Implementation has not started yet.

## Overview

- Official name: Haori.js Bootstrap
- Package identifier: haori-js-bootstrap
- Upstream Haori.js repository: https://github.com/meibinlab/haori-js
- Target Bootstrap version: 5.3.x
- Planned distribution formats: ESM and IIFE

The goal is to replace Haori.js static UI methods such as dialog, confirm, toast, openDialog, closeDialog, addErrorMessage, and clearMessages with Bootstrap-based behavior while keeping existing Procedure integration intact.

## Current Status

- Initial design completed
- README and design documents prepared
- Source code and tests are not implemented yet

## Planned Repository Layout

- The implementation repository is planned to follow the upstream Haori.js layout at the top level, using src, tests, demo, docs/ja, and playwright.
- Source files are planned as TypeScript-based ESM modules with a mostly flat src structure centered on index, browser, install, bootstrap_haori, dialog, toast, modal, and message.
- Tests and demos are planned to be organized by feature so that Procedure compatibility, fallback behavior, and browser loading examples can be verified in parallel.
- The current design document remains under doc during the design phase and is planned to move under docs/ja when implementation starts.

## Planned Scope

- Replace Haori.js UI-related static methods with Bootstrap-based implementations
- Support automatic activation for browser direct loading and ESM import
- Keep compatibility with existing data-click-* based Procedure flows
- Provide fallback behavior when Bootstrap JS is unavailable

## Planned Public API

The current design assumes the following APIs.

| API | Purpose | Planned return value |
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

## Planned Package Output

- The primary npm entry is planned as dist/haori-js-bootstrap.js, with dist/index.d.ts as the published type entry.
- Browser direct loading is planned to use dist/haori-js-bootstrap.iife.js, exposing auxiliary hooks through window.HaoriBootstrap.
- package.json exports are intentionally limited to the root entry in the initial version, without publishing internal entries such as ./browser or ./install.

## Integration Plan

### Browser Direct Loading

Load dependencies in this order:

1. Haori.js
2. Bootstrap CSS
3. bootstrap.bundle.js
4. haori-js-bootstrap

The planned IIFE build will auto-enable on load when window.Haori and window.bootstrap are available.
It may also expose window.HaoriBootstrap.install and window.HaoriBootstrap.uninstall as auxiliary hooks for recovery and testing, and install is treated as an override and re-apply API rather than the primary activation path.

### ESM

The planned ESM build will also auto-enable on import when window.Haori and window.bootstrap are available. Call install only when you need to override the default options.

```js
import 'haori-js-bootstrap';
```

Example when overriding the default options:

```js
import { install } from 'haori-js-bootstrap';

install({
  fallbackToNative: true,
});
```

## Documents

- Japanese README: [README.ja.md](README.ja.md)
- Initial design: [doc/Haori.js Bootstrap初期設計書.md](doc/Haori.js Bootstrap初期設計書.md)

## Notes

- The design currently assumes that Bootstrap CSS and JS are provided by the application side.
- Haori.js is treated as a peer-like prerequisite and is not planned to be bundled.
- HTML input for dialog and toast messages is not planned to be supported in the first version.
