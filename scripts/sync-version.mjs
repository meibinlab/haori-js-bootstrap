import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const packageJsonPath = resolve(projectRoot, 'package.json');
const entryPointPath = resolve(projectRoot, 'src', 'index.ts');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const entryPointSource = readFileSync(entryPointPath, 'utf8');
const updatedEntryPointSource = entryPointSource.replace(
  /export const version = '.*';/,
  `export const version = '${packageJson.version}';`,
);

if (entryPointSource === updatedEntryPointSource) {
  throw new Error('src/index.ts の version 定数を更新できませんでした。');
}

writeFileSync(entryPointPath, updatedEntryPointSource);