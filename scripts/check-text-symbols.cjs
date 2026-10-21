#!/usr/bin/env node
/**
 * Text symbol checker.
 * Fails if em dashes or emoji characters appear in text files.
 * Checks the given files, or every tracked file when none are given.
 */

'use strict';

const { readFileSync } = require('fs');
const { execFileSync } = require('child_process');

const FORBIDDEN = new RegExp(
  '[\u2014\u2300-\u23ff\u2600-\u27bf\u2b00-\u2bff\ufe0f\u200d\u{1f000}-\u{1ffff}]',
  'u',
);
const SKIP = new Set(['pnpm-lock.yaml']);

function listFiles() {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    return args;
  }
  return execFileSync('git', ['ls-files'], { encoding: 'utf-8' }).split('\n').filter(Boolean);
}

const problems = [];
for (const file of listFiles()) {
  if (SKIP.has(file.split(/[\\/]/).pop())) {
    continue;
  }
  let buffer;
  try {
    buffer = readFileSync(file);
  } catch {
    continue;
  }
  if (buffer.includes(0)) {
    continue;
  }
  buffer
    .toString('utf-8')
    .split('\n')
    .forEach((line, index) => {
      if (FORBIDDEN.test(line)) {
        problems.push(`${file}:${index + 1}: ${line.trim().slice(0, 100)}`);
      }
    });
}

if (problems.length > 0) {
  console.error('[text-symbols] Em dashes or emojis found:');
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}
console.log('[text-symbols] No em dashes or emojis found.');
