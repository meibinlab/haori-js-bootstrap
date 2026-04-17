# Haori.js Bootstrap

Haori.js Bootstrap is a Bootstrap-based UI extension library for Haori.js.

This repository contains the current implementation, tests, demos, and the initial design documentation for the library.

## Overview

- Official name: Haori.js Bootstrap
- Package identifier: haori-js-bootstrap
- Upstream Haori.js repository: https://github.com/meibinlab/haori-js
- Target Bootstrap version: 5.3.x
- Planned distribution formats: ESM and IIFE

The goal is to replace Haori.js static UI methods such as dialog, confirm, toast, openDialog, closeDialog, addErrorMessage, and clearMessages with Bootstrap-based behavior while keeping existing Procedure integration intact.

## Current Status

- Initial design completed
- Core source code and unit tests are implemented
- Library and demo builds are available in the current repository

## Repository Layout

- The repository follows the upstream Haori.js layout at the top level, centered on src, tests, demo, and doc.
- Source files are organized as TypeScript-based ESM modules with a mostly flat src structure centered on index, browser, install, bootstrap_haori, dialog, toast, modal, and message.
- Tests and demos are organized by feature so that Procedure compatibility, fallback behavior, and browser loading examples can be verified in parallel.
- The initial design document currently remains under doc as an implementation reference.

## Scope

- Replace Haori.js UI-related static methods with Bootstrap-based implementations
- Support automatic activation for browser direct loading and ESM import
- Keep compatibility with existing data-click-* based Procedure flows
- Provide fallback behavior when Bootstrap JS is unavailable

## Public API Design

The current implementation targets the following API design.

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

## Package Output

- The primary npm entry is dist/haori-js-bootstrap.js, with dist/index.d.ts as the published type entry.
- Browser direct loading uses dist/haori-js-bootstrap.iife.js, exposing auxiliary hooks through window.HaoriBootstrap.
- package.json exports are intentionally limited to the root entry in the initial version, without publishing internal entries such as ./browser or ./install.

## Integration

### Browser Direct Loading

Load dependencies in this order:

1. Haori.js
2. Bootstrap CSS
3. bootstrap.bundle.js
4. haori-js-bootstrap

The IIFE build auto-enables on load when window.Haori and window.bootstrap are available.
It may also expose window.HaoriBootstrap.install and window.HaoriBootstrap.uninstall as auxiliary hooks for recovery and testing, and install is treated as an override and re-apply API rather than the primary activation path.

### ESM

The ESM build also auto-enables on import when window.Haori and window.bootstrap are available. Call install only when you need to override the default options.

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
