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

## Planned Scope

- Replace Haori.js UI-related static methods with Bootstrap-based implementations
- Support browser direct loading and explicit ESM installation
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
| install(options) | Install Bootstrap-backed Haori | void |
| uninstall() | Restore the original Haori implementation | void |

## Integration Plan

### Browser Direct Loading

Load dependencies in this order:

1. Haori.js
2. Bootstrap CSS
3. bootstrap.bundle.js
4. haori-js-bootstrap

The planned IIFE build will auto-install only when window.Haori and window.bootstrap are available.

### ESM

The planned ESM build will avoid import-time side effects and require an explicit install call.

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
