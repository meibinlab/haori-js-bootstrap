import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * 参照するコア Haori.js の版数が、リポジトリ全体で揃っていることの検査。
 *
 * <p>デモと README は jsDelivr 上のコアを版数付きで読み込む。リリース時にどれかを
 * 更新し忘れると、そのページだけ古いコアとの組み合わせを見せ続ける。本パッケージの
 * 版数については同じ取り残しが 0.5.16 まで実際に起きており（`scripts/sync-version.mjs`
 * のコメント）、コアの版数は同期スクリプトの対象外で手作業のままである。
 *
 * <p>根拠は仕様書ではなくリリース手順（参照するコアの版数を全箇所で揃える）。
 */
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** コアを読み込む script タグの src に一致する正規表現。 */
const coreScriptUrlPattern = /cdn\.jsdelivr\.net\/npm\/haori@([^/]+)\/dist\/haori\.iife\.js/g;

/**
 * 検査対象のファイルを列挙する。
 *
 * @return リポジトリルートからの相対パスの配列。
 */
function collectTargets(): string[] {
  const demoDirectory = join(projectRoot, 'demo');
  const demoFiles = readdirSync(demoDirectory)
    .filter((name) => name.endsWith('.html'))
    .map((name) => join('demo', name));
  return [...demoFiles, 'README.md', 'README.ja.md'];
}

describe('参照するコア Haori.js の版数', () => {
  it('すべての参照が同じ版数を指す', () => {
    const found: { file: string; version: string }[] = [];
    for (const target of collectTargets()) {
      const source = readFileSync(join(projectRoot, target), 'utf8');
      for (const matched of source.matchAll(coreScriptUrlPattern)) {
        found.push({ file: target, version: matched[1] });
      }
    }

    // 参照が消えていないことも確かめる（正規表現の取りこぼしで空振りしないため）。
    expect(found.length).toBeGreaterThanOrEqual(6);
    const versions = [...new Set(found.map((entry) => entry.version))];
    expect(
      versions,
      `コアの版数が揃っていません:\n${found
        .map((entry) => `${relative('.', entry.file)}: ${entry.version}`)
        .join('\n')}`,
    ).toHaveLength(1);
  });
});
