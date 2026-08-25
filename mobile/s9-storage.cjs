/* S9 unit check: insufficient storage handling (mocked FS) */
const fs = require('fs');
const path = require('path');
const ts = require(path.join(__dirname, 'node_modules', 'typescript'));
let pass = 0, fail = 0;
const check = (n, c, d) => { if (c) { pass++; console.log(`  PASS [${n}]`); } else { fail++; console.log(`  FAIL [${n}] ${d || ''}`); } };

const fsStub = {
  cacheDirectory: 'file:///cache/',
  getFreeDiskStorageAsync: async () => freeBytes,
  getInfoAsync: async () => ({ exists: true }),
  makeDirectoryAsync: async () => {},
  writeAsStringAsync: async () => { if (freeBytes < 1024 * 1024 * 50) { const e = new Error('ENOSPC'); throw e; } },
  deleteAsync: async () => {},
  readDirectoryAsync: async () => []
};
let freeBytes = 10 * 1024 * 1024 * 1024;

(async () => {
  const SM = (() => {
    const js = ts.transpileModule(
      fs.readFileSync(path.join(__dirname, 'src', 'services', 'storageManager.ts'), 'utf8'),
      { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 } }
    ).outputText;
    const mod = { exports: {} };
    new Function('require', 'module', 'exports', js)(n => {
      if (n.includes('async-storage')) { const m = {
        getItem: async k => null, setItem: async () => {}, removeItem: async () => {}
      }; return { ...m, default: m }; }
      if (n.includes('expo-file-system')) { const m = fsStub; return { ...m, default: m }; }
      if (n.includes('react-native')) return { Platform: { OS: 'android' } };
      return {};
    }, mod, mod.exports);
    return mod.exports;
  })();

  freeBytes = 30 * 1024 * 1024; // below 50MB threshold
  let err = null;
  try { await SM.assertEnoughStorageForRecording(); } catch (e) { err = e; }
  check('S9: throws INSUFFICIENT_STORAGE when < 50MB free', err?.code === 'INSUFFICIENT_STORAGE');
  check('S9: friendly user message, no paths leaked', /storage/i.test(err?.message || '') && !/file:\/\//.test(err?.message || ''));
  freeBytes = 500 * 1024 * 1024;
  let ok = true;
  try { await SM.assertEnoughStorageForRecording(); } catch { ok = false; }
  check('S9: allows recording with ample space', ok);

  console.log(`\n[S9 RESULT] ${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error('[FATAL]', e.message); process.exit(1); });
