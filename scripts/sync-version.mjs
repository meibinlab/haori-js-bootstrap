import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const packageJsonPath = resolve(projectRoot, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const { name: packageName, version } = packageJson;

/**
 * 文字列を正規表現用にエスケープする。
 *
 * @param {string} value エスケープ対象の文字列。
 * @return {string} エスケープ済み文字列。
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * patch 版を 1 つ進めた次回リリース例の版数を返す。
 *
 * @param {string} currentVersion 現在の版数。
 * @return {string} 次回 patch 版数。
 */
function getNextPatchVersion(currentVersion) {
  const versionParts = currentVersion.split('.').map((part) => Number(part));
  if (versionParts.length !== 3 || versionParts.some((part) => Number.isNaN(part))) {
    throw new Error(`不正な version 形式です: ${currentVersion}`);
  }

  return `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`;
}

/**
 * ファイル内容に対して置換を適用する。
 *
 * @param {string} filePath 更新対象ファイルの絶対パス。
 * @param {{ pattern: RegExp, replacement: string }[]} replacements 置換定義の配列。
 * @return {void}
 */
function updateFile(filePath, replacements) {
  let source = readFileSync(filePath, 'utf8');

  for (const { pattern, replacement } of replacements) {
    if (!pattern.test(source)) {
      throw new Error(`${filePath} に想定したパターンが見つかりません: ${pattern}`);
    }

    source = source.replace(pattern, replacement);
  }

  writeFileSync(filePath, source);
}

const nextPatchVersion = getNextPatchVersion(version);
const cdnScriptUrl = `https://cdn.jsdelivr.net/npm/${packageName}@${version}/dist/${packageName}.iife.js`;
const entryPointPath = resolve(projectRoot, 'src', 'index.ts');
const readmePath = resolve(projectRoot, 'README.md');
const readmeJaPath = resolve(projectRoot, 'README.ja.md');
const demoCdnHtmlPath = resolve(projectRoot, 'demo', 'cdn.html');
const demoCdnScriptPath = resolve(projectRoot, 'demo', 'cdn.js');
const demoSpecPath = resolve(projectRoot, 'playwright', 'demo.spec.ts');

updateFile(entryPointPath, [
  {
    pattern: /export const version = '.*';/,
    replacement: `export const version = '${version}';`,
  },
]);

updateFile(readmePath, [
  {
    pattern: /^Version: .*/m,
    replacement: `Version: ${version}`,
  },
  {
    pattern: new RegExp(
      `https://cdn\\.jsdelivr\\.net/npm/${escapeRegExp(packageName)}@[^/]+/dist/${escapeRegExp(packageName)}\\.iife\\.js`,
      'g',
    ),
    replacement: cdnScriptUrl,
  },
  {
    pattern: /Example next patch release after `[^`]+`:/,
    replacement: `Example next patch release after \`${version}\`:`,
  },
  {
    pattern: /# version becomes \d+\.\d+\.\d+/,
    replacement: `# version becomes ${nextPatchVersion}`,
  },
  {
    pattern: /Create and publish the GitHub Release for the pushed tag such as `[^`]+`\./,
    replacement: `Create and publish the GitHub Release for the pushed tag such as \`${nextPatchVersion}\`.`,
  },
]);

updateFile(readmeJaPath, [
  {
    pattern: /^Version: .*/m,
    replacement: `Version: ${version}`,
  },
  {
    pattern: new RegExp(
      `https://cdn\\.jsdelivr\\.net/npm/${escapeRegExp(packageName)}@[^/]+/dist/${escapeRegExp(packageName)}\\.iife\\.js`,
      'g',
    ),
    replacement: cdnScriptUrl,
  },
  {
    pattern: /# version が \d+\.\d+\.\d+ になる/,
    replacement: `# version が ${nextPatchVersion} になる`,
  },
  {
    pattern: /例として次回は `[^`]+` タグになります。/,
    replacement: `例として次回は \`${nextPatchVersion}\` タグになります。`,
  },
]);

updateFile(demoCdnHtmlPath, [
  {
    pattern: /公開中の `[^`]+`/,
    replacement: `公開中の \`${version}\``,
  },
  {
    pattern: new RegExp(`${escapeRegExp(packageName)}: \\d+\\.\\d+\\.\\d+`),
    replacement: `${packageName}: ${version}`,
  },
  {
    pattern: new RegExp(
      `https://cdn\\.jsdelivr\\.net/npm/${escapeRegExp(packageName)}@[^/]+/dist/${escapeRegExp(packageName)}\\.iife\\.js`,
    ),
    replacement: cdnScriptUrl,
  },
]);

updateFile(demoCdnScriptPath, [
  {
    pattern: /haoriBootstrapVersion === "\d+\.\d+\.\d+"/,
    replacement: `haoriBootstrapVersion === "${version}"`,
  },
]);

updateFile(demoSpecPath, [
  {
    pattern: /CDN 版 Haori\.js Bootstrap \d+\.\d+\.\d+ が有効です。/,
    replacement: `CDN 版 Haori.js Bootstrap ${version} が有効です。`,
  },
  {
    pattern: new RegExp(
      `https://cdn\\.jsdelivr\\.net/npm/${escapeRegExp(packageName)}@[^/]+/dist/${escapeRegExp(packageName)}\\.iife\\.js`,
    ),
    replacement: cdnScriptUrl,
  },
]);