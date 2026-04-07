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
 * パッケージの開発中版数。
 */
export const version = '0.0.0';
