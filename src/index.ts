import './browser';

export { BootstrapHaori } from './bootstrap_haori';
export { hasAutoEnablePrerequisites, install, isInstalled, uninstall } from './install';
export type {
  BootstrapNamespace,
  BrowserWindow,
  HaoriBootstrapGlobal,
  HaoriGlobalObject,
  InstallOptions,
  ResolvedInstallOptions,
} from './types';

/**
 * パッケージの公開版数。
 */
export const version = '0.1.0';
