const requiredModules = ['better-sqlite3', 'node-pty'];

try {
  for (const moduleName of requiredModules) {
    require(moduleName);
  }
  // better-sqlite3 loads its native binding lazily, so require() alone
  // succeeds even when the binary was built for a different ABI.
  const Database = require('better-sqlite3');
  new Database(':memory:').close();
  console.log('[desktop] Electron native module validation passed');
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error('[desktop] Electron native module validation failed');
  console.error(message);
  process.exit(1);
}
