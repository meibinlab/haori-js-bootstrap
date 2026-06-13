import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  setupCollapsePersistence,
  teardownCollapsePersistence,
} from '../src/collapse_persist';

const PERSIST_ATTR = 'data-haori-persist';
const STORAGE_PREFIX = 'haori-bootstrap:collapse:';

/**
 * 次のマイクロタスク/タスクまで待機する（MutationObserver の発火待ち）。
 *
 * @return 解決される Promise。
 */
function tick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * collapse 要素を生成して body へ追加する。
 *
 * @param id 要素 id。
 * @param key 永続化キー。
 * @param shown 初期表示状態。
 * @return 生成した要素。
 */
function appendCollapse(id: string, key: string, shown: boolean): HTMLElement {
  const el = document.createElement('div');
  el.id = id;
  el.className = shown ? 'collapse show' : 'collapse';
  el.setAttribute(PERSIST_ATTR, key);
  document.body.appendChild(el);
  return el;
}

describe('collapse 開閉状態の永続化', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    teardownCollapsePersistence();
    window.sessionStorage.clear();
    document.body.innerHTML = '';
  });

  it('setup 時に保存済み "shown" を復元して show クラスを付与する', () => {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}menu`, 'shown');
    const el = appendCollapse('menu', 'menu', false);

    setupCollapsePersistence();

    expect(el.classList.contains('show')).toBe(true);
  });

  it('setup 時に保存済み "hidden" を復元して show クラスを除去する', () => {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}menu`, 'hidden');
    const el = appendCollapse('menu', 'menu', true);

    setupCollapsePersistence();

    expect(el.classList.contains('show')).toBe(false);
  });

  it('shown.bs.collapse / hidden.bs.collapse で状態を保存する', () => {
    const el = appendCollapse('menu', 'menu', false);
    setupCollapsePersistence();

    el.dispatchEvent(new CustomEvent('shown.bs.collapse', { bubbles: true }));
    expect(window.sessionStorage.getItem(`${STORAGE_PREFIX}menu`)).toBe('shown');

    el.dispatchEvent(new CustomEvent('hidden.bs.collapse', { bubbles: true }));
    expect(window.sessionStorage.getItem(`${STORAGE_PREFIX}menu`)).toBe(
      'hidden',
    );
  });

  it('永続化属性を持たない collapse は保存しない', () => {
    const el = document.createElement('div');
    el.id = 'plain';
    el.className = 'collapse';
    document.body.appendChild(el);
    setupCollapsePersistence();

    el.dispatchEvent(new CustomEvent('shown.bs.collapse', { bubbles: true }));
    expect(window.sessionStorage.length).toBe(0);
  });

  it('data-import 等で後から挿入された要素にも復元を適用する', async () => {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}later`, 'shown');
    setupCollapsePersistence();

    // setup 後に挿入（MutationObserver 経由で復元される）
    const el = appendCollapse('later', 'later', false);
    await tick();

    expect(el.classList.contains('show')).toBe(true);
  });

  it('復元時にトグル要素の aria-expanded と collapsed クラスを同期する', () => {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}menu`, 'shown');
    const toggle = document.createElement('button');
    toggle.setAttribute('data-bs-toggle', 'collapse');
    toggle.setAttribute('data-bs-target', '#menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.className = 'collapsed';
    document.body.appendChild(toggle);
    appendCollapse('menu', 'menu', false);

    setupCollapsePersistence();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.classList.contains('collapsed')).toBe(false);
  });

  it('保存値が無い場合は初期状態を変更しない', () => {
    const el = appendCollapse('menu', 'menu', true);
    setupCollapsePersistence();
    expect(el.classList.contains('show')).toBe(true);
  });
});
