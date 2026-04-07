import type {
  BootstrapModalConstructor,
  BootstrapModalInstance,
  BootstrapNamespace,
  BootstrapToastConstructor,
  BootstrapToastInstance,
} from './types';

function isConstructor<T>(value: unknown): value is new (...args: readonly unknown[]) => T {
  return typeof value === 'function';
}

/**
 * Bootstrap の Modal コンストラクターを返す。
 *
 * @param bootstrap Bootstrap 名前空間。
 * @return Modal コンストラクター。見つからない場合は undefined。
 */
export function resolveModalConstructor(
  bootstrap?: BootstrapNamespace,
): BootstrapModalConstructor | undefined {
  return isConstructor<BootstrapModalInstance>(bootstrap?.Modal)
    ? (bootstrap?.Modal as BootstrapModalConstructor)
    : undefined;
}

/**
 * Bootstrap の Toast コンストラクターを返す。
 *
 * @param bootstrap Bootstrap 名前空間。
 * @return Toast コンストラクター。見つからない場合は undefined。
 */
export function resolveToastConstructor(
  bootstrap?: BootstrapNamespace,
): BootstrapToastConstructor | undefined {
  return isConstructor<BootstrapToastInstance>(bootstrap?.Toast)
    ? (bootstrap?.Toast as BootstrapToastConstructor)
    : undefined;
}

/**
 * Modal が利用可能かどうかを返す。
 *
 * @param bootstrap Bootstrap 名前空間。
 * @return 利用可能なら true。
 */
export function hasModalSupport(bootstrap?: BootstrapNamespace): boolean {
  return Boolean(resolveModalConstructor(bootstrap));
}

/**
 * Toast が利用可能かどうかを返す。
 *
 * @param bootstrap Bootstrap 名前空間。
 * @return 利用可能なら true。
 */
export function hasToastSupport(bootstrap?: BootstrapNamespace): boolean {
  return Boolean(resolveToastConstructor(bootstrap));
}

/**
 * Modal インスタンスを取得または生成する。
 *
 * @param element 対象要素。
 * @param bootstrap Bootstrap 名前空間。
 * @return Modal インスタンス。生成できない場合は undefined。
 */
export function createModalInstance(
  element: HTMLElement,
  bootstrap?: BootstrapNamespace,
): BootstrapModalInstance | undefined {
  const modalConstructor = resolveModalConstructor(bootstrap);
  if (!modalConstructor) {
    return undefined;
  }

  if (typeof modalConstructor.getOrCreateInstance === 'function') {
    return modalConstructor.getOrCreateInstance(element);
  }

  return new modalConstructor(element);
}

/**
 * Toast インスタンスを取得または生成する。
 *
 * @param element 対象要素。
 * @param bootstrap Bootstrap 名前空間。
 * @return Toast インスタンス。生成できない場合は undefined。
 */
export function createToastInstance(
  element: HTMLElement,
  bootstrap?: BootstrapNamespace,
): BootstrapToastInstance | undefined {
  const toastConstructor = resolveToastConstructor(bootstrap);
  if (!toastConstructor) {
    return undefined;
  }

  if (typeof toastConstructor.getOrCreateInstance === 'function') {
    return toastConstructor.getOrCreateInstance(element);
  }

  return new toastConstructor(element);
}
